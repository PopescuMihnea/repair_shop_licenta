import * as yup from "yup";

const passwordRegister = yup
  .string()
  .test({
    message: "Password is too short",
    test: (password) => {
      return password !== undefined && password.length >= 6;
    },
  })
  .matches(/[a-z]/, { message: "Password must contain a lowercase letter" })
  .matches(/[A-Z]/, {
    message: "Password must contain a uppercase letter",
  })
  .matches(/[0-9]/, {
    message: "Password must contain a number",
  });

export default passwordRegister;
