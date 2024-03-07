import csurf from "csurf";
import { Router } from "express";
import { Roles } from "../enums/roles";
import { authorize } from "../middleware/authorize";
import repairShopController from "../controllers/repairShop";
import repairShop from "../controllers/repairShop";

const router = Router();
const enableHttps = process.env.HTTPS;
const csurfProtect = csurf({
  cookie: { httpOnly: true, secure: enableHttps ? true : false },
});

router.get("/getNumber", repairShop.getNumber);
router.get("/getAll", repairShop.getUnauthorized);
router.get("/get/:id", authorize([Roles.Manager]), repairShop.getOne);
router.get(
  "/getUser/:id",
  authorize([Roles.User, Roles.Manager]),
  repairShop.getOneUser
);
router.get("/get", authorize([Roles.Manager]), repairShop.get);

router.post(
  "/post",
  authorize([Roles.Manager]),
  csurfProtect,
  repairShopController.postOne
);

router.put(
  "/put/:id",
  authorize([Roles.Manager]),
  csurfProtect,
  repairShopController.putOne
);

router.delete(
  "/delete/:id",
  authorize([Roles.Manager]),
  csurfProtect,
  repairShop.deleteOne
);

export default { router };
