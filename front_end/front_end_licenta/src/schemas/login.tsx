import * as yup from "yup";
import { IUserLogin } from "../interfaces/user/IUserLogin";
import email from "./partialSchemas/email";
import passwordLogin from "./partialSchemas/passwordLogin";

export const loginSchema = yup.object<IUserLogin>().shape({
  email: email,
  password: passwordLogin.required("Password is required"),
  stayLoggedIn: yup.boolean().required("Option to stay logged in is required"),
});
