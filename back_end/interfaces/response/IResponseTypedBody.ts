import { Response } from "express";
import { Send } from "express-serve-static-core";

export interface IResponseTypedBody<T> extends Response {
  json: Send<T, this>;
}
