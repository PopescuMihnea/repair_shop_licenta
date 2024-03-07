import { IUserLogin } from "../../interfaces/user/IUserLogin";
import { useFormik } from "formik";
import { loginSchema } from "../../schemas/login";
import { useUserContext } from "../../context/user";
import { FormattedMessage } from "react-intl";
import { useLanguageContextMessages } from "../../context/language";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const Login: React.FC = () => {
  const backendUri = import.meta.env.VITE_REACT_BACKEND_API;
  const changeEmail = useUserContext().actions.changeEmail;
  const navigate = useNavigate();
  const location = useLocation();
  /*console.log("state", location.state);
  console.log("state return url", location.state.returnUrl);*/
  const returnUrl =
    location.state !== null ? location.state.returnUrl : undefined;
  const languageContext: any = useLanguageContextMessages().language;
  const [loginTime, setLoginTime] = useState("72");
  /*console.log("returnUrl: ", returnUrl);
  console.log("backUrl: ", backUrl);*/

  useEffect(() => {
    const getCsfr = async (): Promise<void> => {
      try {
        const url = `${backendUri}/csrf`;
        const res = await fetch(url, { credentials: "include" });
        const resBody: { csrfToken: string } = await res.json();
        values._csrf = resBody.csrfToken;
      } catch (error) {
        console.error("Error fetching csfr:", error);
      }
    };

    const getLoginTime = async (): Promise<void> => {
      try {
        const url = `${backendUri}/auth/loginTime`;
        const res = await fetch(url);
        const resBody: { time: string } = await res.json();
        setLoginTime(resBody.time);
      } catch (error) {
        console.error("Error getting log in time", error);
      }
    };

    getCsfr();
    getLoginTime();
  }, [backendUri]);

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
  } = useFormik<IUserLogin>({
    initialValues: {
      email: "",
      password: "",
      stayLoggedIn: false,
      _csrf: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values): Promise<void> => {
      setSubmitting(true);
      const url = `${backendUri}/login`;
      //console.log(values);
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
            const session = !values.stayLoggedIn;
            changeEmail(values.email, session);
            navigate(returnUrl !== undefined ? returnUrl : "/user");
          } else if (response.status === 401) {
            setFieldError("email", "Invalid email or password");
          }
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
              placeholder={languageContext["app.email.login.placeholder"]}
              id="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
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
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.password && errors.password && (
              <div className="invalid-feedback">
                {languageContext.errors[errors.password]}
              </div>
            )}
          </div>
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="stayLoggedIn"
              checked={values.stayLoggedIn}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <label className="form-check-label" htmlFor="stayLoggedIn">
              <FormattedMessage
                id="app.stayLoggedIn"
                defaultMessage="Stay logged in for 72 hours"
                values={{ nrHours: loginTime }}
              />
            </label>
            {touched.stayLoggedIn && errors.stayLoggedIn && (
              <div className="invalid-feedback">
                {languageContext.errors[errors.stayLoggedIn]}
              </div>
            )}
          </div>
          <div className="d-flex justify-content-between">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <FormattedMessage
                  id="app.loggingIn"
                  defaultMessage="Logging in..."
                />
              ) : (
                <FormattedMessage id="app.logIn" defaultMessage="Log in" />
              )}
            </button>
            <NavLink to="/requestResetPassword" className="text-white">
              <FormattedMessage
                id="app.forgotPassword"
                defaultMessage="Forgot your password?"
              />
            </NavLink>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
