const colors = require('vuetify/es5/util/colors').default
const environment = process.env.NODE_ENV || 'development'

export default {
  mode: 'universal',
  srcDir: 'src',
  buildDir: '.nuxt',
  /*
   ** Headers of the page
   */
  head: {
    htmlAttrs: {
      prefix: 'og: http://ogp.me/ns#'
    },
    title: 'おうちで時間割',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content:
          'おうちにいても先生から課題が届きます！時間割に合わせて楽しく学んでコロナ休校を乗り切ろう！'
      },
      { hid: 'robots', name: 'robots', content: 'noindex' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon-precomposed.png' },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      {
        hid: 'og:image',
        property: 'og:image',
        content: 'https://studyathome.web.app/ogp.png'
      },
      {
        hid: 'twitter:image',
        name: 'twitter:image',
        content: 'https://studyathome.web.app/ogp.png'
      },
      {
        hid: 'og:title',
        property: 'og:title',
        content: 'おうちで時間割'
      }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    {
      src: '@/plugins/persistedstate.js',
      ssr: false
    },
    {
      src: '@/plugins/dayjs.js',
      ssr: true
    }
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/stylelint-module
    '@nuxtjs/stylelint-module',
    '@nuxt/typescript-build',
    '@nuxtjs/vuetify'
  ],
  typescript: {
    typeCheck: true,
    ignoreNotFoundWarnings: true
  },
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/firebase',
    'nuxt-webfontloader',
    // Doc: https://github.com/nuxt-community/dotenv-module
    ['@nuxtjs/dotenv', { filename: `.env.${environment}` }],
    'nuxt-svg-loader'
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  webfontloader: {
    google: {
      families: ['Roboto&display=swap', 'NotoSansJP&&display=swap']
    }
  },
  firebase: {
    config: {
      production: {
        apiKey: 'AIzaSyDryyjdTrz5FWFveRwjiRqmUaE6yje2vas',
        authDomain: 'studyathome.firebaseapp.com',
        databaseURL: 'https://studyathome.firebaseio.com',
        projectId: 'studyathome',
        storageBucket: 'studyathome.appspot.com',
        messagingSenderId: '133064394534',
        appId: '1:133064394534:web:9198f1bf636a12535e63e7',
        measurementId: 'G-N9EMMWHQJV'
      },
      development: {
        apiKey: 'AIzaSyCav4DOx10ki9XW7ZsGzt9ENXgBhB-oQQY',
        authDomain: 'studyathome-dev.firebaseapp.com',
        databaseURL: 'https://studyathome-dev.firebaseio.com',
        projectId: 'studyathome-dev',
        storageBucket: 'studyathome-dev.appspot.com',
        messagingSenderId: '837731952989',
        appId: '1:837731952989:web:90728f8e4b8b6ca8dc60b4',
        measurementId: 'G-8763ED3W29'
      }
    },
    onFirebaseHosting: true,
    services: {
      auth: {
        persistence: 'local',
        /*
        initialize: {
          onAuthStateChangedMutation: 'SET_AUTH_USER',
          onAuthStateChangedAction: null,
        },
        */
        ssr: true
      },
      firestore: {
        enablePersistence: true
      },
      functions: true,
      storage: false,
      realtimeDb: false,
      performance: true,
      analytics: true,
      remoteConfig: {
        settings: {
          fetchTimeoutMillis: 60000, // Default
          minimumFetchIntervalMillis: 43200000 // Default
        },
        defaultConfig: {
          welcome_message: 'Welcome'
        }
      },
      messaging: {
        createServiceWorker: true
      }
    }
  },
  pwa: {
    manifest: {
      name: 'おうちで時間割',
      short_name: 'おうちで時間割',
      theme_color: '#0071C2',
      background_color: '#ffffff',
      display: 'standalone',
      Scope: '/',
      start_url: '/',
      splash_pages: null
    },

    workbox: {
      importScripts: [
        // ...
        '/firebase-auth-sw.js'
      ],
      // by default the workbox module will not install the service worker in dev environment to avoid conflicts with HMR
      // only set this true for testing and remember to always clear your browser cache in development
      dev: false
    }
  },
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },
  env: {
    APIKEY: process.env.APIKEY,
    AUTHDOMAIN: process.env.AUTHDOMAIN,
    DATABASEURL: process.env.DATABASEURL,
    PROJECTID: process.env.PROJECTID,
    STORAGEBUCKET: process.env.STORAGEBUCKET,
    MESSAGINGSENDERID: process.env.MESSAGINGSENDERID,
    APPID: process.env.APPID,
    MEASUREMENTID: process.env.MEASUREMENTID
  },
  /*
   ** Build configuration
   */
  build: {
    publicPath: '/assets/',
    babel: {
      presets({ isServer }) {
        return [
          [
            require.resolve('@nuxt/babel-preset-app'),
            // require.resolve('@nuxt/babel-preset-app-edge'), // For nuxt-edge users
            {
              buildTarget: isServer ? 'server' : 'client',
              corejs: { version: 3 }
            }
          ]
        ]
      }
    },
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue|ts)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
