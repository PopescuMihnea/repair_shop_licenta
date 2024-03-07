import { ICar } from "./ICar";

export interface ICarModify extends Omit<ICar, "image"> {
  image?: File;
}
