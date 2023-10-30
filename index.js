import express from "express";
import cors from "cors";
import { config } from "dotenv";
import {authRouter} from "./src/routes/authRouter.js";
import {fileRouter} from "./src/routes/fileRouter.js";
import Log4jConfigurator from "./utils/log4jConfigurator.js";
const app = express();

const logger = new Log4jConfigurator();
logger.configureLogger('ALL');
config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());
app.use("/auth", authRouter);
app.use("/file", fileRouter);

app.listen(process.env.PORT || 3003, () => {
  console.log("Server started");
});




