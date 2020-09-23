const admin = require('firebase-admin');
const serviceAccount = require('./remo-tables-firebase.json');

module.exports = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://remo-tables.firebaseio.com',
});
