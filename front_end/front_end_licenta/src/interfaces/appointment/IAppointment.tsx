import { ICar } from "../car/ICar";
import { IElement } from "../element/IElement";
import { IRepairShop } from "../repairShop/IRepairShop";

export interface IAppointment extends IElement {
  status: string;
  date: string;
  car?: string | ICar;
  repairShop?: string | IRepairShop;
}
