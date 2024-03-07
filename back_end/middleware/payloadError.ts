import { NextFunction, Request, Response } from "express";
import { isErrorWithMessage } from "../interfaces/typeGuards/isErrorWithMessage";

export const payloadError = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isErrorWithMessage(err) && err.message == "request entity too large") {
    console.log("Payload too large");
    res.sendStatus(401);
  } else {
    next();
  }
};
