import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { Query } from "express-serve-static-core";

export interface IRequestTyped<T, U extends Query, V extends ParamsDictionary>
  extends Request {
  body: T;
  query: U;
  params: V;
}
