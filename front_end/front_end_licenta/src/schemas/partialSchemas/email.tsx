import * as yup from "yup";

const email = yup
  .string()
  .required("Email is required")
  .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, {
    message: "Invalid email format",
  })
  .test({
    message: "Invalid email domain",
    test: (email) => {
      const validEmailHosts = ["gmail.com", "yahoo.com", "hotmail.com"];
      const domain = email.split("@")[1];
      return validEmailHosts.includes(domain);
    },
  });

export default email;
