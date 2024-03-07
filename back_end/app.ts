import { Request, Response } from "express";
import https from "https";
import express from "express";
import dotenv from "dotenv";
import logger from "morgan";
import mongoose, { ConnectOptions } from "mongoose";
import fs from "fs";
import { deleteOldLinks } from "./helpers/deleteOldLinks";
import { createFile } from "./helpers/createFile";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import cors from "cors";
import { isErrorNode } from "./interfaces/typeGuards/isErrorNode";
import { csrfError } from "./middleware/csrfError";
import bodyParser from "body-parser";
import { payloadError } from "./middleware/payloadError";
import {
  intervalDeleteLinksMinutes,
  requestBodySizeLimitMb,
  minutesToMilis,
  intervalCompleteAppointmentMinutes,
} from "./consts";
import repairShop from "./routes/repairShop";
import { completeOldAppointments } from "./helpers/completeOldAppointments";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import carRouter from "./routes/car";
import appointmentRouter from "./routes/appointment";
import { Status } from "./enums/status";

setInterval(deleteOldLinks, intervalDeleteLinksMinutes * minutesToMilis);
setInterval(
  completeOldAppointments,
  intervalCompleteAppointmentMinutes * minutesToMilis
);

const whitelist = [
  "https://localhost:5173",
  "https://127.0.0.1:5173",
  "localhost:5173",
  "127.0.0.1:5173",
  "https://192.168.56.1:5173",
];

dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

const port = process.env.PORT;
const host = process.env.HOST;
const dbConnectionString = process.env.DB_CONNECTION_STRING as string;
const logFileName = process.env.REQUESTS_LOG_FILENAME as string;
const enableHttps = process.env.HTTPS;

//aplicatia express
const app = express();
//conectarea la baza de date
mongoose
  .connect(dbConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions)
  .then((res) => {
    console.log("connected to db");
    if (enableHttps) {
      try {
        const key = fs.readFileSync("../HTTPSCert/cars.com+6-key.pem");
        const cert = fs.readFileSync("../HTTPSCert/cars.com+6.pem");

        const httpsOptions = {
          key: key,
          cert: cert,
        };

        https
          .createServer(httpsOptions, app)
          .listen(parseInt(port!), host, undefined, () => {
            console.log("Server https is running on host:", process.env.HOST);
            console.log("Server https is running on port:", process.env.PORT);
            console.log("Logging requests on console");
            console.log(
              'Log format is: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]'
            );
          });
      } catch (err) {
        if (isErrorNode(err) && err.code === "ENOENT") {
          console.log("Could not load https certificate files");
        } else {
          console.log("Unknown error: ", err);
        }
      }
    } else {
      app.listen(port, () => {
        console.log("Server is running on port:", process.env.PORT);
        console.log("Logging requests on console");
        console.log(
          'Log format is: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]'
        );
      });
    }
  })
  .catch((err) => {
    console.log("Error connecting to database: ", err);
    throw err;
  });

//directorul pt. logger
const logData = `Log file created at ${Date.now} \n\nLog format: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version " :status :res[content-length] ":referrer" ":user-agent"\n`;
const logPath = `./logs/${logFileName}.log`;
createFile(logPath, logData);

app.use(
  cors({
    origin: whitelist,
    credentials: true,
  })
);

//vom scrie date despre requesturi intr-un fisier .log si in consola
app.use(
  logger("combined", {
    stream: fs.createWriteStream(logPath, { flags: "a" }),
  })
);
app.use(logger("common"));

//acest middleware va transforma stringul primit din request body de tip form/urlencoded intr-un java script object
app.use(
  bodyParser.urlencoded({
    extended: false,
    limit: `${requestBodySizeLimitMb}mb`,
  })
);

//acest middleware va transforma stringul primit din request body de tip json intr-un java script object
app.use(bodyParser.json({ limit: `${requestBodySizeLimitMb}mb` }));
app.use(cookieParser());

app.use(payloadError);

const csurfProtect = csurf({
  cookie: {
    httpOnly: true,
    secure: enableHttps ? true : false,
    sameSite: enableHttps ? "strict" : undefined,
  },
});

app.get("/csrf", csurfProtect, (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use("/user", userRouter.router);
app.use("/car", carRouter.router);
app.use("/repairShop", repairShop.router);
app.use("/appointment", appointmentRouter.router);
app.use(authRouter.router);

//console.log("status values: ", Object.values(Status));

app.use(csrfError);
