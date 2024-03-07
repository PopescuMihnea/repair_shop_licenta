export interface IUserLogin {
  email: string;
  password: string;
  stayLoggedIn: boolean;
  _csrf: string;
}
