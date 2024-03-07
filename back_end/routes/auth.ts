import { Router } from "express";
import csurf from "csurf";
import authController from "../controllers/auth";
import { authorize } from "../middleware/authorize";
import { Roles } from "../enums/roles";

const router = Router();
const enableHttps = process.env.HTTPS;
const csurfProtect = csurf({
  cookie: { httpOnly: true, secure: enableHttps ? true : false },
});

router.get("/auth/loginTime", authController.getLoginTime);
router.get(
  "/logout",
  authorize([Roles.User, Roles.Manager, Roles.Admin]),
  authController.logout
);

router.post("/register", authController.register);
router.post("/login", csurfProtect, authController.login);
router.post(
  "/auth/verify",
  authorize([Roles.User, Roles.Manager, Roles.Admin]),
  csurfProtect,
  authController.resendVerifyEmail
);
router.post("/auth/verify/:url", csurfProtect, authController.verifyEmail);
router.post("/auth/reset/", csurfProtect, authController.resetPasswordEmail);
router.post("/auth/reset/:url", csurfProtect, authController.resetPassword);

export default { router };
