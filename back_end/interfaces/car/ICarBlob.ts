import { IBlobFile } from "../IBlobFile";
import { ICar } from "./ICar";

export interface ICarBlob extends Omit<ICar, "image" | "user"> {
  image?: IBlobFile;
}
