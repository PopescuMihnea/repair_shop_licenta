import { Request, NextFunction } from "express";
import { isForbiddenError } from "../interfaces/typeGuards/isForbiddenError";
import { IResponseJson } from "../interfaces/response/IResponseJson";
import { IResponseTypedBody } from "../interfaces/response/IResponseTypedBody";

export const csrfError = (
  err: unknown,
  req: Request,
  res: IResponseTypedBody<IResponseJson>,
  next: NextFunction
) => {
  if (isForbiddenError(err)) {
    const resBody: IResponseJson = { message: "Unauthorized" };
    res.status(403).json(resBody);
    console.log("invalid csrf token");
  }
  next();
};
