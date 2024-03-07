import * as yup from "yup";

const lastName = yup
  .string()
  .required("Last name is required")
  .test({
    message: "Last name is too short",
    test: (lastName) => {
      return lastName !== undefined && lastName.length >= 2;
    },
  })
  .matches(/^[a-zA-Z]+(-[a-zA-Z]+)?$/, {
    message: "Name can only contain letters and -",
  });

export default lastName;
