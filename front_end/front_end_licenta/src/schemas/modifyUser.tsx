import * as yup from "yup";
import { IUserModify } from "../interfaces/user/IUserModify";
import email from "./partialSchemas/email";
import passwordLogin from "./partialSchemas/passwordLogin";
import firstName from "./partialSchemas/firstName";
import lastName from "./partialSchemas/lastName";

export const modifyUserSchema = yup.object<IUserModify>().shape({
  email: email,
  oldPassword: passwordLogin,
  password: yup
    .string()
    .test({
      message: "Password is too short",
      test: (password) => {
        return (
          (password !== undefined && password.length >= 6) ||
          password === undefined
        );
      },
    })
    .matches(/^(?=.*[a-z])|^$/, {
      message: "Password must contain a lowercase letter",
    })
    .matches(/^(?=.*[A-Z])|^$/, {
      message: "Password must contain a uppercase letter",
    })
    .matches(/^(?=.*\d)|^$/, {
      message: "Password must contain a number",
    }),
  confirmPassword: passwordLogin,
  firstName: firstName,
  lastName: lastName,
});
