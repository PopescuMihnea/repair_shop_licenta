import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";

export interface IRequestTypedParams<T extends ParamsDictionary>
  extends Request {
  params: T;
}
