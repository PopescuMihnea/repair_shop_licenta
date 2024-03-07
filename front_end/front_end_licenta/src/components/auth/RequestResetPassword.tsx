import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as yup from "yup";
import email from "../../schemas/partialSchemas/email";
import { FormattedMessage } from "react-intl";
import { useLanguageContextMessages } from "../../context/language";

const RequestResetPassword: React.FC = () => {
  const backendUri = import.meta.env.VITE_REACT_BACKEND_API;
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
    touched,
    isSubmitting,
    setSubmitting,
  } = useFormik<{ email: string; _csrf: string }>({
    initialValues: {
      email: "",
      _csrf: "",
    },
    validationSchema: yup.object<{ email: string }>().shape({ email: email }),
    onSubmit: async (values): Promise<void> => {
      setSubmitting(true);
      setShowResetMessage(false);
      console.log(values);
      const url = `${backendUri}/auth/reset`;
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      })
        .then((_) => {
          setShowResetMessage(true);
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
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <FormattedMessage
                id="app.sendingResetEmail"
                defaultMessage="Sending email..."
              />
            ) : (
              <FormattedMessage
                id="app.sendResetEmail"
                defaultMessage="Send password reset"
              />
            )}
          </button>
        </form>
        {showResetMessage && (
          <div className="text-success">
            <FormattedMessage
              id="app.resetEmailMessage"
              defaultMessage="If the email exists and is verified a password reset link was sent"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestResetPassword;
