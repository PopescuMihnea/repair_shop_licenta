import * as yup from "yup";
import { IUserRegister } from "../interfaces/user/IUserRegister";
import { Roles } from "../enums/roles";
import email from "./partialSchemas/email";
import passwordRegister from "./partialSchemas/passwordRegister";
import firstName from "./partialSchemas/firstName";
import lastName from "./partialSchemas/lastName";

export const registerSchema = yup.object<IUserRegister>().shape({
  email: email,
  password: passwordRegister.required("Password is required"),
  firstName: firstName,
  lastName: lastName,
  role: yup
    .string()
    .required("Role is required")
    .test({
      message: "Invalid role",
      test: (role) => {
        return Object.values(Roles).includes(role);
      },
    }),
});
