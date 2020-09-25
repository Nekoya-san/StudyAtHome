import {
  action,
  createModule,
  createProxy,
  mutation,
} from 'vuex-class-component'
import { AppStore } from '@/store/modules/app'
import { UserStore } from '@/store/modules/user'
import classData from '@/types/store/classData'
import { API, Auth, graphqlOperation } from 'aws-amplify'
import { GRAPHQL_AUTH_MODE, GraphQLResult } from '@aws-amplify/api'
import { getClass, listLessonsByClass } from '@/graphql/queries'
import { createClass, createLesson, updateLesson } from '@/graphql/mutations'
import { GetClassQuery, ListLessonsByClassQuery } from '@/API'
import { vxm } from '@/store'

type LessonsGroupedBy = {
  [key: string]: classData.LessonWithId[]
}

const VuexModule = createModule({
  namespaced: 'classData',
  strict: false,
  target: 'nuxt',
})

const generateUniqueId = (): string => {
  const c =
    'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'
  const cl = c.length
  const result =
    c[Math.floor(Math.random() * cl)] +
    c[Math.floor(Math.random() * cl)] +
    c[Math.floor(Math.random() * cl)] +
    c[Math.floor(Math.random() * cl)] +
    c[Math.floor(Math.random() * cl)] +
    c[Math.floor(Math.random() * cl)]
  return result + ''
}
// Generate a new Date object with a specified date & time
const d = (date: Date, hours: number, minutes: number, seconds: number) => {
  const newDate = new Date(date)
  newDate.setHours(hours)
  newDate.setMinutes(minutes)
  newDate.setSeconds(seconds)
  return newDate
}

const getFullDayArray = (date: Date) => {
  const start = d(date, 0, 0, 0)
  const end = d(date, 24, 0, 0)
  return [start, end]
}

export class ClassDataStore extends VuexModule implements classData.ClassData {
  classId: classData.ClassId = ''
  className: string = ''
  lessonsGroupByPeriod: LessonsGroupedBy = {}

  @action
  public async lessonsOnCurrentDate(date: Date) {
    const lessons = (await API.graphql({
      query: listLessonsByClass,
      variables: {
        classId: this.classId,
        startTime: {
          between: getFullDayArray(date),
        },
      },
    })) as GraphQLResult<ListLessonsByClassQuery>

    return lessons.data?.listLessonsByClass?.items as any[]
  }

  @action
  public async lessonsOnCurrentDateAuthModeAPIKEY(date: Date) {
    const lessons = (await API.graphql({
      query: listLessonsByClass,
      variables: {
        classId: this.classId,
        startTime: {
          between: getFullDayArray(date),
        },
      },
      authMode: GRAPHQL_AUTH_MODE.API_KEY,
    })) as GraphQLResult<ListLessonsByClassQuery>

    return lessons.data?.listLessonsByClass?.items as any[]
  }

  public get isLoaded(): boolean {
    return !!this.className
  }

  @action
  public async loadClassData(classId: classData.ClassId) {
    const result = (await API.graphql(
      graphqlOperation(getClass, { id: classId })
    )) as GraphQLResult<GetClassQuery>

    const classObject = result?.data?.getClass
    if (!classObject) {
      throw new Error('クラスIDが間違っています')
    }

    const className = classObject.className
    this.setClassData({
      classId,
      className,
    })
  }

  @action
  public async registerClass({
    className,
    schoolName,
  }: {
    className: string
    schoolName: string
  }) {
    if (!vxm.user.isAuthenticated) {
      throw new Error('ユーザーが正しくログインされていません')
    }

    let classId, classObject
    do {
      classId = generateUniqueId()
      try {
        const result = (await API.graphql(
          graphqlOperation(getClass, {
            id: classId,
          })
        )) as GraphQLResult<GetClassQuery>
        classObject = result?.data?.getClass
      } catch {
        throw new Error('エラーによって処理に失敗しました')
      }
    } while (classObject)

    try {
      const user = await Auth.currentAuthenticatedUser()
      await API.graphql(
        graphqlOperation(createClass, {
          input: {
            id: classId,
            className,
            schoolName,
            owner: user.username,
          },
        })
      )
    } catch {
      throw new Error('エラーによって処理に失敗しました')
    }
    this.setClassData({
      classId,
      className,
    })
  }

  @action
  public async registerLesson(lessonData: classData.Lesson) {
    try {
      const user = await Auth.currentAuthenticatedUser()
      await API.graphql(
        graphqlOperation(createLesson, {
          input: {
            classId: this.classId,
            owner: user.username,
            ...lessonData,
          },
        })
      )
    } catch {
      throw new Error('エラーによって処理に失敗しました')
    }
    await this.getLessonsByCurrentDate()
  }

  @action
  public async changeLesson({
    editData,
    id,
  }: {
    editData: any
    id: classData.LessonId
  }) {
    try {
      await API.graphql(
        graphqlOperation(updateLesson, {
          input: {
            id,
            ...editData,
          },
        })
      )
    } catch {
      throw new Error('エラーによって処理に失敗しました')
    }
    await this.getLessonsByCurrentDate()
  }

  @mutation
  public setClassData({ classId, className }: classData.ClassData) {
    this.classId = classId
    this.className = className
  }

  @mutation
  public setLessonsGroupByPeriod(lessons: classData.LessonWithId[]) {
    const groupBy = (
      targets: classData.LessonWithId[],
      key: keyof classData.LessonWithId
    ) =>
      targets.reduce(
        (acc: LessonsGroupedBy, currentLesson: classData.LessonWithId) => {
          const valueToGroup = currentLesson[key].toString()
          acc[valueToGroup] = acc[valueToGroup] || []
          acc[valueToGroup].push(currentLesson)
          return acc
        },
        {}
      )
    this.lessonsGroupByPeriod = groupBy(lessons, 'startTime')
  }

  @action
  public async getLessonsByCurrentDate() {
    const appStore = createProxy(this.$store, AppStore)
    const userStore = createProxy(this.$store, UserStore)
    const lessons = userStore.isLoginWithAPIKEY
      ? await this.lessonsOnCurrentDateAuthModeAPIKEY(appStore.currentDate)
      : await this.lessonsOnCurrentDate(appStore.currentDate)
    await this.setLessonsGroupByPeriod(lessons)
  }

  @action
  public async unloadClassData() {
    this.setClassData({
      classId: '',
      className: '',
    })
    this.lessonsGroupByPeriod = {}
  }
}
