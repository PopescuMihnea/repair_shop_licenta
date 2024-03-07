import { IUser } from "./IUser";

export interface IUserModify extends IUser {
  oldPassword: string;
  confirmPassword: string;
  _csrf: string;
}
