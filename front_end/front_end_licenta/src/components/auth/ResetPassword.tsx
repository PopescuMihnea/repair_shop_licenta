import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { IResetPassword } from "../../interfaces/IResetPassword";
import * as yup from "yup";
import passwordRegister from "../../schemas/partialSchemas/passwordRegister";
import { FormattedMessage } from "react-intl";
import { useLanguageContextMessages } from "../../context/language";

const ResetPassword: React.FC = () => {
  const backendUri = import.meta.env.VITE_REACT_BACKEND_API;
  const { id } = useParams();
  const [showResetMessage, setShowResetMessage] = useState(false);
  const languageContext: any = useLanguageContextMessages().language;

  useEffect(() => {
    const getCsfr = async (): Promise<void> => {
      try {
        const url = `${backendUri}/csrf`;
        const res = await fetch(url, { credentials: "include" });
        const csrf: { csrfToken: string } = await res.json();
        values._csrf = csrf.csrfToken;
      } catch (error) {
        console.error("Error fetching csfr:", error);
      }
    };

    getCsfr();
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
  } = useFormik<IResetPassword>({
    initialValues: {
      password: "",
      confirmPassword: "",
      _csrf: "",
    },
    validationSchema: yup
      .object<IResetPassword>()
      .shape({ password: passwordRegister, confirmPassword: passwordRegister }),
    onSubmit: async (values): Promise<void> => {
      setSubmitting(true);
      setShowResetMessage(false);
      console.log(values);

      if (values.confirmPassword !== values.password) {
        setFieldError("password", "Passwords must match");
        setFieldError("confirmPassword", "Passwords must match");
        setSubmitting(false);
        return;
      }

      const url = `${backendUri}/auth/reset/${id}`;
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
            setShowResetMessage(true);
          } else if (response.status === 401) {
            setFieldError("password", "Code has expired");
          } else if (response.status === 404) {
            setFieldError("password", "Code not found");
          } else {
          }
        })
        .catch((error) => console.error(error));
      setSubmitting(false);
    },
  });

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <div className="w-50">
        <form onSubmit={handleSubmit}>
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
            <label htmlFor="confirmPassword" className="form-label">
              <FormattedMessage
                id="app.confirmPassword"
                defaultMessage="Confirm password"
              />
            </label>
            <input
              type="password"
              placeholder={languageContext["app.confirmPassword.placeholder"]}
              className={
                touched.confirmPassword
                  ? errors.confirmPassword
                    ? "form-control is-invalid"
                    : "form-control is-valid"
                  : "form-control"
              }
              id="confirmPassword"
              aria-describedby="confirmPasswordHelp"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <div id="confirmPasswordHelp" className="form-text">
              <FormattedMessage
                id="app.password.help"
                defaultMessage="The password must contain at least 1 number, lowercase and uppercase letter and be at least 6 characters long"
              />
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <div className="invalid-feedback">
                {languageContext.errors[errors.confirmPassword]}
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
                id="app.sendingResetPassword"
                defaultMessage="Resetting password..."
              />
            ) : (
              <FormattedMessage
                id="app.sendResetPassword"
                defaultMessage="Reset password"
              />
            )}
          </button>
        </form>
        {showResetMessage && (
          <div className="text-success">
            <FormattedMessage
              id="app.resetPasswordMessage"
              defaultMessage="Password has been reset"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
