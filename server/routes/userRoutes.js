import express from "express";
import { auth } from "../middlewares/auth.js"; 
import { getPiblishedCreations, getUserCreations, toggleLikeCreations, togglePublishCreation } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get('/get-user-creations', auth, getUserCreations)
userRouter.get('/get-published-creations', auth, getPiblishedCreations)
userRouter.post('/toggle-like-creation', auth, toggleLikeCreations)
userRouter.post('/toggle-publish', auth, togglePublishCreation)

export default userRouter;