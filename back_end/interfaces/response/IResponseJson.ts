import { IError } from "../error/IError";

export interface IResponseJson {
  message: string;
  errors?: IError[];
}
