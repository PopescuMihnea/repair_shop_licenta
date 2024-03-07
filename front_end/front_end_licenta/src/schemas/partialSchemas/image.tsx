import * as yup from "yup";
import { getJsFileExtension } from "../../helpers/getJsFileExtension";
import { maxFileSize, validFileTypes } from "../../consts";

export const image = yup
  .mixed()
  .notRequired()
  .test({
    message: "Invalid image type",
    test: (file) => {
      const isValid = validFileTypes.includes(
        getJsFileExtension((file as File)?.name)
      );
      return isValid || !file;
    },
  })
  .test({
    message: "File size exceeds limit",
    test: (file) => {
      const isValid = (file as File)?.size < maxFileSize;
      return isValid || !file;
    },
  });
