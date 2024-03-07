import { Router } from "express";
import csurf from "csurf";
import { authorize } from "../middleware/authorize";
import { Roles } from "../enums/roles";
import userController from "../controllers/user";

const router = Router();
const enableHttps = process.env.HTTPS;
const csurfProtect = csurf({
  cookie: { httpOnly: true, secure: enableHttps ? true : false },
});

router.get(
  "/",
  authorize([Roles.User, Roles.Manager, Roles.Admin]),
  userController.getOne
);
router.get("/:id", authorize([Roles.Admin]), userController.getOneAdmin);

router.put(
  "/modify",
  authorize([Roles.User, Roles.Manager, Roles.Admin]),
  csurfProtect,
  userController.putOne
);

router.delete(
  "/delete",
  authorize([Roles.User, Roles.Manager, Roles.Admin]),
  csurfProtect,
  userController.deleteOne
);
router.delete(
  "/delete/:id",
  authorize([Roles.Admin]),
  csurfProtect,
  userController.deleteOneAdmin
);

export default { router };
