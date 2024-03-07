import { IUserLogin } from "./IUserLogin";

export interface IUser extends Omit<IUserLogin, "stayLoggedIn"> {
  firstName: string;
  lastName: string;
  verified?: boolean;
  role: string;
}
