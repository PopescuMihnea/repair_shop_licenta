import fs from "fs";

export const deleteFolderRecursive = (folderPath: string) => {
  const regex = /^\.\/blob\//;
  if (regex.test(folderPath)) {
    if (fs.existsSync(folderPath)) {
      fs.readdirSync(folderPath).forEach(function (file) {
        var curPath = folderPath + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) {
          // recurse
          deleteFolderRecursive(curPath);
        } else {
          // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(folderPath);
    }
  } else {
    console.log(
      `A delete folder was attempted outside of backend blob directory: ${folderPath}`
    );
  }
};
