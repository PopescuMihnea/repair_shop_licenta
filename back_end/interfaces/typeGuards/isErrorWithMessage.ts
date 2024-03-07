import { IErrorWithMessage } from "../error/IErrorWithMessage";

export function isErrorWithMessage(error: any): error is IErrorWithMessage {
  if (!error.message) {
    return false;
  }
  return error instanceof Error;
}
