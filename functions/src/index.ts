import * as functions from "firebase-functions";
import * as cors from "cors";
import * as express from "express";

const app = express();

app.use(cors({ origin: true }));
app.get("*", (req: express.Request, res: express.Response) => {
  res.send("Hello from express on Firebase with CORS!");
});

exports.app = functions.https.onRequest(app);
