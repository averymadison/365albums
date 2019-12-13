import * as functions from 'firebase-functions';
import * as cors from 'cors';
import * as express from 'express';
import { Request, Response } from 'express';

const app = express();

app.use(cors({ origin: true }));
app.get('*', (req: Request, res: Response) => {
  res.send('Hello from express on Firebase with CORS!');
});

exports.api = functions.https.onRequest(app);
