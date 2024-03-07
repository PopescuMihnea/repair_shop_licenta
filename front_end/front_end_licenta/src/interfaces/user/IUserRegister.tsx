import { IUserLogin } from "./IUserLogin";

export interface IUserRegister
  extends Omit<IUserLogin, "stayLoggedIn" | "_csrf"> {
  firstName: string;
  lastName: string;
  role: string;
}
