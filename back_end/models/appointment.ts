import mongoose, { Types, Error } from "mongoose";
import { Status } from "../enums/status";
import { IAppointment } from "../interfaces/appointment/IAppointment";
const schema = mongoose.Schema;

const appointmentSchema = new schema({
  car: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId,
    ref: "car",
  },
  repairShop: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId,
    ref: "repairShop",
  },
  status: {
    required: true,
    type: String,
    validate: {
      validator: function (value: string | Status) {
        if (!Object.values(Status).includes(value)) {
          throw new Error("Invalid status");
        }
        return true;
      },
    },
  },
  date: {
    required: true,
    type: Date,
    validate: {
      validator: function (date: Date) {
        if (date < new Date()) {
          throw new Error("Invalid date");
        }
        return true;
      },
    },
  },
});

const Appointment = mongoose.model<IAppointment>(
  "appointment",
  appointmentSchema
);

export default Appointment;
