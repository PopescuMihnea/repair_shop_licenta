import { IAddress } from "../IAddress";
import { IElementImage } from "../element/IElementImage";
import { IUser } from "../user/IUser";

export interface IRepairShop extends IElementImage {
  name: string;
  address: IAddress;
  userEmail?: string;
  user?: IUser;
}
