import mongoose, { Types, Error } from "mongoose";
import { ICarDocument } from "../interfaces/car/ICarDocument";
import { deleteFolderRecursive } from "../helpers/deleteFolderRecursive";
import Appointment from "./appointment";
const schema = mongoose.Schema;

const carSchema = new schema(
  {
    image: {
      type: String,
    },
    plateNumber: {
      required: true,
      type: String,
      uppercase: true,
      unique: true,
      minLength: [6, "Plate number is too short"],
      maxLength: [7, "Plate number is too long"],
      match: [
        /^[a-zA-Z0-9]+$/,
        "Plate number can only contain letters and numbers",
      ],
    },
    color: {
      required: true,
      type: String,
      validate: {
        validator: (col: string) => {
          const colors = [
            "alb",
            "galben",
            "portocaliu",
            "roşu",
            "violet",
            "albastru",
            "verde",
            "gri",
            "maro",
            "negru",
          ];

          if (!colors.includes(col.toLowerCase())) {
            throw new Error(`Invalid color, colors can only be: ${colors}`);
          }

          return true;
        },
      },
      uppercase: true,
    },
    VIN: {
      required: true,
      type: String,
      unique: true,
      minLength: [17, "VIN must have 17 characters"],
      maxLength: [17, "VIN must have 17 characters"],
    },
    user: {
      required: true,
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

carSchema.pre<{ _conditions: { _id: Types.ObjectId } }>(
  new RegExp("deleteOne"),
  async function () {
    const car = await Car.findById(this._conditions._id);

    deleteFolderRecursive(`./blob/cars/${car!.plateNumber}`);

    const appointments = await Appointment.find({ car: this._conditions._id });
    appointments.forEach(async (appointment) => {
      await Appointment.deleteOne({ _id: appointment._id });
    });
  }
);

const Car = mongoose.model<ICarDocument>("car", carSchema);

export default Car;
