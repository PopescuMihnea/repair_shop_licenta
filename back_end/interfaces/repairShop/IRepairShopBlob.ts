import { IBlobFile } from "../IBlobFile";
import { IAddress } from "../address/IAddress";
import { IRepairShop } from "./IRepairShop";

export interface IRepairShopBlob
  extends Omit<IRepairShop, "address" | "image" | "user"> {
  image?: IBlobFile;
  name: string;
  address: IAddress;
  userEmail?: string;
}
