import mongoose from "mongoose";
import { IVerifyLinkDocument } from "../interfaces/verifyLink/IVerifyLinkDocument";
const schema = mongoose.Schema;

const verifyLinkSchema = new schema({
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

const VerifyLink = mongoose.model<IVerifyLinkDocument>(
  "verifyLink",
  verifyLinkSchema
);

export default VerifyLink;
