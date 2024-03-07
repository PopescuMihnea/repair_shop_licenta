import { HttpError } from "http-errors";

export function isForbiddenError(error: any): error is HttpError<403> {
  if (!error.status || error.status !== 403) {
    return false;
  }
  return error instanceof Error;
}
