require('dotenv').config()
const admin = require('firebase-admin');

module.exports = admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "remo-tables",
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: (<string>process.env.PRIVATE_KEY).replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-vl0n3%40remo-tables.iam.gserviceaccount.com"
  }),
  databaseURL: 'https://remo-tables.firebaseio.com',
});

export {}