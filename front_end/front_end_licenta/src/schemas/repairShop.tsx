import * as yup from "yup";
import { IRepairShopModify } from "../interfaces/repairShop/IRepairShopModify";
import { image } from "./partialSchemas/image";
import { addressSchema } from "./address";

export const repairShopSchema = yup.object<IRepairShopModify>().shape({
  image: image,
  name: yup
    .string()
    .required("Name is required")
    .matches(/^(?=.*[a-zA-Z])[a-zA-Z0-9 -]+$/, {
      message:
        "Name can only contain alphanumeric characters,spaces or hyphens and must contain letters",
    }),
  address: addressSchema,
});
