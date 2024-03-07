import { Types } from "mongoose";
import { IAddress } from "../address/IAddress";
import { IUser } from "../user/IUser";

export interface IRepairShop {
  _id?: Types.ObjectId;
  image: string;
  fileType?: string;
  name: string;
  address?: IAddress | Types.ObjectId;
  user?: IUser | Types.ObjectId;
}
