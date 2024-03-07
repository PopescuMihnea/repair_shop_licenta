import csurf from "csurf";
import { Router } from "express";
import { authorize } from "../middleware/authorize";
import { Roles } from "../enums/roles";
import carController from "../controllers/car";

const router = Router();
const enableHttps = process.env.HTTPS;
const csurfProtect = csurf({
  cookie: { httpOnly: true, secure: enableHttps ? true : false },
});

router.get(
  "/get/:id",
  authorize([Roles.User, Roles.Manager]),
  carController.getOne
);
router.get("/get", authorize([Roles.User, Roles.Manager]), carController.get);

router.post(
  "/post",
  authorize([Roles.User, Roles.Manager]),
  csurfProtect,
  carController.postOne
);

router.put(
  "/put/:id",
  authorize([Roles.User, Roles.Manager]),
  csurfProtect,
  carController.putOne
);

router.delete(
  "/delete/:id",
  authorize([Roles.User, Roles.Manager]),
  csurfProtect,
  carController.deleteOne
);

export default { router };
