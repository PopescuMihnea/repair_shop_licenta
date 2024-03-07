import mongoose, { Error, Types } from "mongoose";
import { IUserDocument } from "../interfaces/user/IUserDocument";
import { Roles } from "../enums/roles";
import VerifyLink from "./verifyLink";
import ResetLink from "./resetLink";
import Car from "./car";
import RepairShop from "./repairShop";

const userSchema = new mongoose.Schema({
  email: {
    required: true,
    type: String,
    unique: true,
    lowercase: true,
    validate: {
      validator: function (value: string) {
        const validEmailHosts = ["gmail.com", "yahoo.com", "hotmail.com"];

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!emailRegex.test(value)) {
          throw new Error("Invalid email format");
        }

        const domain = value.split("@")[1];
        if (!validEmailHosts.includes(domain)) {
          throw new Error("Invalid email domain");
        }

        return true;
      },
    },
  },
  password: {
    required: true,
    type: String,
    minLength: [6, "Password is too short"],
    match: [
      new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/),
      "Password does not match constraints",
    ],
  },
  firstName: {
    required: true,
    type: String,
    minLength: [2, "Length is too short"],
    match: [
      new RegExp(/^[a-zA-Z]+(-[a-zA-Z]+)?$/),
      "Name can only have letters and -",
    ],
    uppercase: true,
  },
  lastName: {
    required: true,
    type: String,
    minLength: [2, "Length is too short"],
    match: [
      new RegExp(/^[a-zA-Z]+(-[a-zA-Z]+)?$/),
      "Name can only have letters and -",
    ],
    uppercase: true,
  },
  role: {
    required: true,
    type: String,
    immutable: true,
    validate: {
      validator: function (value: string | Roles) {
        if (!Object.values(Roles).includes(value)) {
          throw new Error("Invalid role");
        }
        return true;
      },
    },
  },
  verified: {
    required: true,
    type: Boolean,
    default: () => false,
  },
});

userSchema.pre<{ _conditions: { _id: Types.ObjectId } }>(
  new RegExp("deleteOne"),
  async function () {
    await VerifyLink.deleteOne({ user: this._conditions._id });
    await ResetLink.deleteOne({ user: this._conditions._id });

    const cars = await Car.find({ user: this._conditions._id });
    cars.forEach(async (car) => {
      await Car.deleteOne({ _id: car._id });
    });

    const repairShops = await RepairShop.find({ user: this._conditions._id });
    repairShops.forEach(async (repairShop) => {
      await RepairShop.deleteOne({ _id: repairShop._id });
    });
  }
);

const User = mongoose.model<IUserDocument>("user", userSchema);

export default User;
