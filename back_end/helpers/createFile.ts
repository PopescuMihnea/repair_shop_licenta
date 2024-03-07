import fs from "fs";
import { isErrorNode } from "../interfaces/typeGuards/isErrorNode";

export const createFile = (filePath: string, data: string | Uint8Array) => {
  const parts = filePath.split("/");
  const fileName = parts.pop();
  const directories = parts.slice(0, parts.length);

  let directory = `${directories[0]}`;
  for (let i = 1; i < directories.length; ++i) {
    directory += `/${directories[i]}`;

    try {
      fs.accessSync(directory);
      console.log(`${directory} exists`);
    } catch (err: any) {
      if (isErrorNode(err) && err.code === "ENOENT") {
        console.log(`${directory} does not exist.Creating ${directory}`);
        fs.mkdirSync(directory);
        console.log(`${filePath} directory created`);
      } else {
        console.log(`Unknown error creating ${filePath}: `, err);
        throw err;
      }
    }
  }

  if (!fs.existsSync(filePath)) {
    console.log(`${fileName} does not exist.Creating ${fileName}`);
    try {
      fs.appendFileSync(filePath, data);
      console.log(`${filePath} created`);
    } catch (err) {
      console.log("Could not create file");
      throw err;
    }
  }
};
