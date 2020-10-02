import * as firebase from 'firebase';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: 'remo-tables.firebaseapp.com',
  databaseURL: 'https://remo-tables.firebaseio.com',
  projectId: 'remo-tables',
  storageBucket: 'remo-tables.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();

export default firebase;
