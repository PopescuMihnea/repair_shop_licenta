import { IError } from "../interfaces/error/IError";

export const extractErrorsFromMongoose = (
  str: string
): IError[] | undefined => {
  const index = str.indexOf(":");
  let newStr = "";
  if (index !== -1) {
    newStr = str.slice(0, index) + str.slice(index + 1);
  }
  const regex = /([a-zA-Z0-9]+):([^,]+)/g;
  const matches = newStr.matchAll(regex);

  const errors: IError[] = [];
  for (const match of matches) {
    const key = match[1].trim();
    const message = match[2].trim();
    errors.push({ key, message });
  }

  return errors.length > 0 ? errors : undefined;
};
