import fs from "fs";
import { isErrorNode } from "../interfaces/typeGuards/isErrorNode";

export const deleteFile = (filePath: string) => {
  const regex = /^\.\/blob\//;
  if (regex.test(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err: any) {
      if (isErrorNode(err) && err.code === "ENOENT") {
        console.log(`Could not delete${filePath}, does not exist.`);
      } else {
        console.log(`Unknown error deleting file ${filePath}: `, err);
        throw err;
      }
    }
  } else {
    console.log(
      `A delete was attempted outside of backend blob directory: ${filePath}`
    );
  }
};
