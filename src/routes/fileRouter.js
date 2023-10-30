import express from "express";
import {connection} from '../db/localhostConnection.js';
import FileController from "../controllers/fileController.js";
import FileManagerService from "../services/fileManager.service.js";
import AuthMiddleware from "../../middlewares/authMiddleware.js";

const fileService = new FileManagerService(connection);
const fileController = new FileController(fileService);
const fileRouter = express.Router();

fileRouter.post('/upload', AuthMiddleware.verifyToken, fileController.upload);
fileRouter.get('/list', AuthMiddleware.verifyToken, fileController.list);
fileRouter.delete('/delete/:id', AuthMiddleware.verifyToken, fileController.delete);
fileRouter.get('/:id', AuthMiddleware.verifyToken, fileController.getFile);
fileRouter.get('/download/:id', AuthMiddleware.verifyToken, fileController.download);
fileRouter.put('/update/:id', AuthMiddleware.verifyToken, fileController.update);

export {fileRouter};