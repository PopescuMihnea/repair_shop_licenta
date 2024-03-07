import { IUserLogin } from "./IUserLogin";

export interface IUser extends Omit<IUserLogin, "stayLoggedIn"> {
  _id?: string;
  firstName: string;
  lastName: string;
  verified?: boolean;
  role: string;
}
