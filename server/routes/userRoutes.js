import express from "express";
import {
  login,
  register,
  logout,
  getProfile,
  getSuggestedUser,
  followOrUnfollow,
  editProfile,
} from "../controller/userController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.route("/register").post(register);
// router.post("/register", register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/:id/profile").get(isAuthenticated, getProfile);
router
  .route("/profile/edit")
  .post(isAuthenticated, upload.single("profilePhoto"), editProfile);
router.route("/suggested").get(isAuthenticated, getSuggestedUser);
router.route("/followorunfollow/:id").post(isAuthenticated, followOrUnfollow);

export default router;
