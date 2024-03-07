export const getJsFileExtension = (fileName: string) => {
  const re = /(?:\.([^.]+))?$/;
  const fileType = re.exec(fileName);
  if (fileType != null) {
    return fileType[0].toLowerCase();
  }
  return "";
};
