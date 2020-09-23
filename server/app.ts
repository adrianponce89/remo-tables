// tslint:disable-next-line: no-var-requires
const express = require('express');
// tslint:disable-next-line: no-var-requires
const cors = require('cors');
// tslint:disable-next-line: no-var-requires
const bodyParser = require('body-parser');

const auth = require('./config/firebase').auth();

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(decodeIDToken);

app.use('/', require('./routes'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

async function decodeIDToken(req: any, res: any, next: any) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    const idToken = req.headers.authorization.split('Bearer ')[1];
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      req['currentUser'] = decodedToken;
    } catch (err) {
      console.log(err);
    }
  }
  next();
}
