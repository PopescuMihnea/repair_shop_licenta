import * as yup from "yup";

const plateNumber = yup
  .string()
  .required("Plate number is required")
  .test({
    message: "Plate number is too short",
    test: (plateNumber) => {
      return plateNumber !== undefined && plateNumber.length >= 6;
    },
  })
  .test({
    message: "Plate number is too long",
    test: (plateNumber) => {
      return plateNumber !== undefined && plateNumber.length <= 7;
    },
  })
  .matches(/^[a-zA-Z0-9]+$/, {
    message: "Plate number can only contain letters and numbers",
  });

export default plateNumber;
