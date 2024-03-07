import mongoose, { Types, Error } from "mongoose";
import { counties } from "../consts";
import { IAddressDocument } from "../interfaces/address/IAddressDocument";
const schema = mongoose.Schema;

const addressSchema = new schema({
  street: {
    required: true,
    type: String,
    uppercase: true,
    match: [
      /^(?=.*[a-zA-Z])[a-zA-Z0-9 .,-]+$/,
      "Street can only contain alphanumeric characters, dots, hyphens, commas or spaces and must contain letters",
    ],
  },
  city: {
    required: true,
    type: String,
    uppercase: true,
    match: [
      /^(?=.*[a-zA-Z])[a-zA-Z -]+$/,
      "City can only contain letters,hyphens and spaces and must contain letters",
    ],
  },
  county: {
    required: true,
    type: String,
    uppercase: true,
    validate: {
      validator: (county: string) => {
        if (!counties.includes(county)) {
          throw new Error("Invalid county");
        }

        return true;
      },
    },
  },
});

const Address = mongoose.model<IAddressDocument>("address", addressSchema);

export default Address;
