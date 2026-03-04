import express from "express";
import {loginUser, myprofile, registerUser, verifyData,profile,listUser, deleteUser} from "../controler/users.js";
import{isAuth,checkAdmin} from'../middleware/isAuth.js'

const router =express.Router();

router.post("/user/register",registerUser)
router.post("/user/verifyData",verifyData);
router.post("/user/login",loginUser);
router.get("/user/myProfile",myprofile);
router.get("/user/profile/:id",profile);
router.get("/user/listofUser",listUser);
// router.delete("/user/delete/:id",isAuth, deleteUser);
router.delete("/user/delete/:id",isAuth,checkAdmin, deleteUser);
export default router;