import AuthController from "../controllers/authController.js";
import express from "express";
import {connection} from '../db/localhostConnection.js';
import AuthService from "../services/auth.service.js";

const authService = new AuthService(connection);
const authController = new AuthController(authService);
const authRouter = express.Router();

authRouter.post('/signin', authController.signIn);
authRouter.get('/signup', authController.signUp);
authRouter.post('/signin/new_token', authController.refreshTokens);
authRouter.get('/logout', authController.logOut);
authRouter.get('/info', authController.info);

export {authRouter};