import { IElementImage } from "../element/IElementImage";
import { IUser } from "../user/IUser";

export interface ICar extends IElementImage {
  plateNumber: string;
  color: string;
  VIN: string;
  user?: IUser;
}
