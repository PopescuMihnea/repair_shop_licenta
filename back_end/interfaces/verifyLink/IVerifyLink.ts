import { Document, Types } from "mongoose";

export interface IVerifyLink extends Document {
  url: string;
  user: Types.ObjectId;
  expires: Date;
}
