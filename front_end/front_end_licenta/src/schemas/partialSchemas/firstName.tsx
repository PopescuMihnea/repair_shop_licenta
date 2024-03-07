import * as yup from "yup";

const firstName = yup
  .string()
  .required("First name is required")
  .test({
    message: "First name is too short",
    test: (firstName) => {
      return firstName !== undefined && firstName.length >= 2;
    },
  })
  .matches(/^[a-zA-Z]+(-[a-zA-Z]+)?$/, {
    message: "Name can only contain letters and -",
  });

export default firstName;
