import { IErrorWithMessage } from "./IErrorWithMessage";

export interface IError extends IErrorWithMessage {
  key: string;
}
