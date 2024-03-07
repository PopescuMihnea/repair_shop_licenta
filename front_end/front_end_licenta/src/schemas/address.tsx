import * as yup from "yup";
import { IAddress } from "../interfaces/IAddress";
import { counties } from "../consts";

export const addressSchema = yup.object<IAddress>().shape({
  street: yup
    .string()
    .required("Street is required")
    .matches(/^(?=.*[a-zA-Z])[a-zA-Z0-9 .,-]+$/, {
      message:
        "Street can only contain alphanumeric characters, dots, hyphens, commas or spaces and must contain letters",
    }),
  city: yup
    .string()
    .required("City is required")
    .matches(/^(?=.*[a-zA-Z])[a-zA-Z -]+$/, {
      message:
        "City can only contain letters,hyphens and spaces and must contain letters",
    }),
  county: yup
    .string()
    .required("County is required")
    .test({
      message: "Invalid county",
      test: (county) => {
        return counties.includes(county);
      },
    }),
});
