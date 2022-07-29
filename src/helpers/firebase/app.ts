import { initializeApp } from 'firebase/app'

let app: ReturnType<typeof initializeApp>

const firebaseConfig = {
  apiKey: 'AIzaSyClrGTzUBEZvK4r9fKDdm_58TlpmwDCp1M',
  authDomain: 'wk-pca.firebaseapp.com',
  projectId: 'wk-pca',
  storageBucket: 'wk-pca.appspot.com',
  messagingSenderId: '746036136069',
  appId: '1:746036136069:web:814ec2ccffaba21ce701ec',
}

type GlobalWithApp = {
  app: typeof app
}

if (process.env.NODE_ENV === 'production') {
  app = initializeApp(firebaseConfig)
} else {
  if (!(global as unknown as GlobalWithApp).app) {
    ;(global as unknown as GlobalWithApp).app = initializeApp(firebaseConfig)
  }

  app = (global as unknown as GlobalWithApp).app
}

export function getApp() {
  if (!app) {
    app = initializeApp(firebaseConfig)
  }

  return app
}

export { app }
