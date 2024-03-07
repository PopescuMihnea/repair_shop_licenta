import { Types } from "mongoose";
import { ICar } from "../car/ICar";
import { IRepairShop } from "../repairShop/IRepairShop";
import { IAppointmentForm } from "./IAppointmentForm";

export interface IAppointment extends Omit<IAppointmentForm, "plateNumber"> {
  _id?: Types.ObjectId;
  status: string;
  car?: Types.ObjectId | ICar;
  repairShop?: Types.ObjectId | IRepairShop;
}
