import { Document, Types } from "mongoose";
import { IUser } from "../user/IUser";
import { Query } from "express-serve-static-core";
import { ParamsDictionary } from "express-serve-static-core";
import { IRequestTyped } from "./IRequestTyped";

export interface IRequestAuthorized<
  T,
  U extends Query,
  V extends ParamsDictionary
> extends IRequestTyped<T, U, V> {
  carsAuthUser?:
    | (Document<unknown, {}, IUser> &
        Omit<
          IUser & {
            _id: Types.ObjectId;
          },
          never
        >)
    | null;
}
