import { Document, Types } from "mongoose";

export interface IResetLink extends Document {
  url: string;
  user: Types.ObjectId;
  expires: Date;
}
