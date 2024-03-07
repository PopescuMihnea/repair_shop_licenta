import { ICsrf } from "../ICsrf";

export interface IUserLogin extends ICsrf {
  email: string;
  password: string;
  stayLoggedIn: boolean;
}
