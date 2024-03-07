import { Types } from "mongoose";

export interface ICar {
  _id?: Types.ObjectId;
  image: string;
  fileType?: string;
  plateNumber: string;
  color: string;
  VIN: string;
  user: Types.ObjectId;
}
