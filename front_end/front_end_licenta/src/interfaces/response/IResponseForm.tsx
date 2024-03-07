import { IResponseJson } from "./IResponseJson";

export interface IResponseForm<T> extends IResponseJson {
  values?: T;
}
