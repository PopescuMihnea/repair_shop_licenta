import { Request } from "express";
import { Query } from "express-serve-static-core";

export interface IRequestTypedQuery<T extends Query> extends Request {
  query: T;
}
