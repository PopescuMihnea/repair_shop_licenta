import { Error as MongooseError } from "mongoose";

export function isErrorMongoose(
  error: any
): error is MongooseError.ValidationError {
  if (!error.keyPattern && !error.kind && !error.errors) {
    return false;
  }
  return error instanceof Error;
}
