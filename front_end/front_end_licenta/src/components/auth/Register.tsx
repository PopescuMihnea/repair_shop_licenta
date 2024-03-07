import { useFormik } from "formik";
import { registerSchema } from "../../schemas/register";
import { IUserRegister } from "../../interfaces/user/IUserRegister";
import { IResponseForm } from "../../interfaces/response/IResponseForm";
import { IUser } from "../../interfaces/user/IUser";
import { useUserContext } from "../../context/user";
import { FormattedMessage } from "react-intl";
import { useLanguageContextMessages } from "../../context/language";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const backendUri = import.meta.env.VITE_REACT_BACKEND_API;
  const changeEmail = useUserContext().actions.changeEmail;
  const languageContext: any = useLanguageContextMessages().language;
  const navigate = useNavigate();
  //console.log(languageContext["app.email.register.placeholder"]);

  const {
    values,
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldError,
    touched,
    isSubmitting,
    setSubmitting,
  } = useFormik<IUserRegister>({
    initialValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "User",
    },
    validationSchema: registerSchema,
    onSubmit: async (values): Promise<void> => {
      setSubmitting(true);

      const url = `${backendUri}/register`;
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      })
        .then((response) => {
          if (response.ok) {
            changeEmail(values.email, true);
            navigate("/user");
          }
          return response.json();
        })
        .then((result: IResponseForm<IUser>) => {
          result.errors?.forEach((error) => {
            if (error.key === "index") {
              setFieldError("email", "Email already exists");
            } else {
              setFieldError(error.key, error.message);
            }
          });
        })
        .catch((error) => console.error(error));
      setSubmitting(false);
    },
  });

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <div className="w-50">
        <img alt="FMI logo" src="/FMI_logo.png" className="img-fluid my-3" />
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <FormattedMessage id="app.email" defaultMessage="Email address" />
            </label>
            <input
              type="email"
              className={
                touched.email
                  ? errors.email
                    ? "form-control is-invalid"
                    : "form-control is-valid"
                  : "form-control"
              }
              placeholder={languageContext["app.email.register.placeholder"]}
              id="email"
              aria-describedby="emailHelp"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <div id="emailHelp" className="form-text">
              <FormattedMessage
                id="app.email.help"
                defaultMessage="The email must not be already used"
              />
            </div>
            {touched.email && errors.email && (
              <div className="invalid-feedback">
                {languageContext.errors[errors.email]}
              </div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              <FormattedMessage id="app.password" defaultMessage="Password" />
            </label>
            <input
              type="password"
              placeholder={languageContext["app.password.placeholder"]}
              className={
                touched.password
                  ? errors.password
                    ? "form-control is-invalid"
                    : "form-control is-valid"
                  : "form-control"
              }
              id="password"
              aria-describedby="passwordHelp"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <div id="passwordHelp" className="form-text">
              <FormattedMessage
                id="app.password.help"
                defaultMessage="The password must contain at least 1 number, lowercase and uppercase letter and be at least 6 characters long"
              />
            </div>
            {touched.password && errors.password && (
              <div className="invalid-feedback">
                {languageContext.errors[errors.password]}
              </div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="firstName" className="form-label">
              <FormattedMessage
                id="app.firstName"
                defaultMessage="First name"
              />
            </label>
            <input
              type="text"
              className={
                touched.firstName
                  ? errors.firstName
                    ? "form-control is-invalid"
                    : "form-control is-valid"
                  : "form-control"
              }
              placeholder={languageContext["app.firstName.placeholder"]}
              id="firstName"
              value={values.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.firstName && errors.firstName && (
              <div className="invalid-feedback">
                {languageContext.errors[errors.firstName]}
              </div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="lastName" className="form-label">
              <FormattedMessage id="app.lastName" defaultMessage="Last name" />
            </label>
            <input
              type="text"
              className={
                touched.lastName
                  ? errors.lastName
                    ? "form-control is-invalid"
                    : "form-control is-valid"
                  : "form-control"
              }
              placeholder={languageContext["app.lastName.placeholder"]}
              id="lastName"
              value={values.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.lastName && errors.lastName && (
              <div className="invalid-feedback">
                {languageContext.errors[errors.lastName]}
              </div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="role" className="form-label">
              <FormattedMessage id="app.role" defaultMessage="Role" />
            </label>
            <select
              id="role"
              value={values.role}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                touched.lastName
                  ? errors.lastName
                    ? "form-select is-invalid"
                    : "form-select is-valid"
                  : "form-select"
              }
            >
              <option value="User">
                <FormattedMessage id="app.role.user" defaultMessage="User" />
              </option>
              <option value="Manager">
                <FormattedMessage
                  id="app.role.manager"
                  defaultMessage="Manager"
                />
              </option>
            </select>
            {touched.role && errors.role && (
              <div className="invalid-feedback">
                {languageContext.errors[errors.role]}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <FormattedMessage
                id="app.submitting"
                defaultMessage="Submitting..."
              />
            ) : (
              <FormattedMessage id="app.submit" defaultMessage="Submit" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
