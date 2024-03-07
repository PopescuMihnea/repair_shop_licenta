import { IBlobFile } from "../IBlobFile";
import { IElement } from "./IElement";

export interface IElementImage extends IElement {
  image?: IBlobFile;
}
