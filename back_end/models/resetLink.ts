import mongoose from "mongoose";
import { IResetLinkDocument } from "../interfaces/resetLink/IResetLinkDocument";
const schema = mongoose.Schema;

const resetLinkSchema = new schema({
  url: {
    required: true,
    type: String,
    unique: true,
  },
  user: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId,
    unique: true,
    ref: "user",
  },
  expires: {
    required: true,
    type: Date,
  },
});

const ResetLink = mongoose.model<IResetLinkDocument>(
  "resetLink",
  resetLinkSchema
);

export default ResetLink;
