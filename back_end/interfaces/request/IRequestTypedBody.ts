import { Request } from "express";

export interface IRequestTypedBody<T> extends Request {
  body: T;
}
