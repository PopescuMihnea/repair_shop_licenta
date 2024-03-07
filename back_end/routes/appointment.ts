import { Router } from "express";
import csurf from "csurf";
import { authorize } from "../middleware/authorize";
import { Roles } from "../enums/roles";
import appointmentController from "..//controllers/appointment";

const router = Router();
const enableHttps = process.env.HTTPS;
const csurfProtect = csurf({
  cookie: { httpOnly: true, secure: enableHttps ? true : false },
});

router.get(
  "/getUser/:id",
  authorize([Roles.User, Roles.Manager]),
  appointmentController.get
);
router.get(
  "/getAllManager/:id",
  authorize([Roles.Manager]),
  appointmentController.getManager
);
router.get(
  "/get/:id",
  authorize([Roles.User, Roles.Manager]),
  appointmentController.getOne
);
router.get(
  "/getManager/:id",
  authorize([Roles.Manager]),
  appointmentController.getOneManager
);

router.post(
  "/post/:id",
  authorize([Roles.User, Roles.Manager]),
  csurfProtect,
  appointmentController.postOne
);

router.put(
  "/accept/:id",
  authorize([Roles.Manager]),
  csurfProtect,
  appointmentController.accept
);
router.put(
  "/deny/:id",
  authorize([Roles.Manager]),
  csurfProtect,
  appointmentController.deny
);

router.delete(
  "/delete/:id",
  authorize([Roles.User, Roles.Manager]),
  csurfProtect,
  appointmentController.deleteOne
);

export default { router };
