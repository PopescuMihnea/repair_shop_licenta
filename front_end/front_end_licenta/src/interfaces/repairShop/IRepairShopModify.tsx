import { IRepairShop } from "./IRepairShop";

export interface IRepairShopModify extends Omit<IRepairShop, "image"> {
  image?: File;
}
