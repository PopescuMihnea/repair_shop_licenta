import { useCallback, useEffect, useState } from "react";
import { IUser } from "../../interfaces/user/IUser";
import { useFormik } from "formik";
import { IUserModify } from "../../interfaces/user/IUserModify";
import { modifyUserSchema } from "../../schemas/modifyUser";
import { IResponseForm } from "../../interfaces/response/IResponseForm";
import { useUserContext } from "../../context/user";
import { FormattedMessage } from "react-intl";
import { useLanguageContextMessages } from "../../context/language";
import { Modal } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const ModifyUser: React.FC = () => {
  const backendUri = import.meta.env.VITE_REACT_BACKEND_API;
  const [user, setUser] = useState<IUser | null>(null);
  const [success, setSuccess] = useState(false);
  const [globalMessage, setGlobalMessage] = useState("");
  const [csrf, setCsrf] = useState("");
  const changeEmail = useUserContext().actions.changeEmail;
  const languageContext: any = useLanguageContextMessages().language;

  useEffect(() => {
    const getCsfr = async (): Promise<void> => {
      try {
        const url = `${backendUri}/csrf`;
        const res = await fetch(url, { credentials: "include" });
        const resBody: { csrfToken: string } = await res.json();
        setCsrf(resBody.csrfToken);
      } catch (error) {
        console.error("Error fetching csfr:", error);
      }
    };

    const getUser = async (): Promise<void> => {
      try {
        const url = `${backendUri}/user`;
        const res = await fetch(url, { credentials: "include" });
        const user: IUser = await res.json();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    getCsfr();
    getUser();
  }, [backendUri]);

  const {
    values,
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldError,
    submitForm,
    touched,
    isSubmitting,
    setSubmitting,
  } = useFormik<IUserModify>({
    initialValues: {
      email: user !== null ? user.email : "",
      oldPassword: "",
      password: "",
      confirmPassword: "",
      firstName: user !== null ? user.firstName : "",
      lastName: user !== null ? user.lastName : "",
      role: "",
      _csrf: csrf,
    },
    enableReinitialize: true,
    validationSchema: modifyUserSchema,
    onSubmit: async (values): Promise<void> => {
      setSubmitting(true);
      setSuccess(false);
      setGlobalMessage("");
      handleModalClose();

      if (values.oldPassword === "" && values.email !== user!.email) {
        setFieldError(
          "oldPassword",
          "Password is required when changing email"
        );
      }

      if (values.password !== "" && values.oldPassword === "") {
        setFieldError("oldPassword", "Password is required");
        setSubmitting(false);
        return;
      }

      if (values.confirmPassword !== values.password) {
        setFieldError("password", "Passwords must match");
        setFieldError("confirmPassword", "Passwords must match");
        setSubmitting(false);
        return;
      }

      const url = `${backendUri}/user/modify`;
      await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      })
        .then(async (response) => {
          if (response.ok) {
            const emailStorageKey = "carsUserEmail";
            const session =
              window.sessionStorage.getItem(emailStorageKey) !== null;
            changeEmail(values.email, session);

            setSuccess(true);
            setGlobalMessage("User info changed");
          } else if (response.status === 401) {
            setFieldError("oldPassword", "Invalid password");
          } else if (response.status === 400) {
            setFieldError("password", "Passwords do not match");
            setFieldError("confirmPassword", "Passwords do not match");
          } else if (response.status === 422) {
            const result: IResponseForm<IUserModify> = await response.json();
            result.errors?.forEach((error) => {
              if (error.key === "index") {
                setFieldError("email", "Email already exists");
              } else {
                setFieldError(error.key, error.message);
              }
            });
          } else if (response.status === 500) {
            setGlobalMessage("There was an error modifying the information");
          }
        })
        .catch((error) => console.error(error));
      setSubmitting(false);
    },
  });

  const [showModal, setShowModal] = useState(false);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleSubmitButtonClick = useCallback(() => {
    setShowModal(true);
  }, []);

  //console.log("global: ", globalMessage);

  return (
    <>
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id="app.userModifyTitle"
              defaultMessage="Modify user confirmation"
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormattedMessage
            id="app.userModifyConfirm"
            defaultMessage="Are you sure you want to modify the user?"
          />
        </Modal.Body>
        <Modal.Footer>
          <button
            type="submit"
            onClick={submitForm}
            className="btn btn-success"
          >
            <FormattedMessage id="app.submit" defaultMessage="Submit" />
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleModalClose}
          >
            <FormattedMessage id="app.close" defaultMessage="Close" />
          </button>
        </Modal.Footer>
      </Modal>
      <NavLink to="/user" className="my-3">
        <button type="button" className="btn btn-primary ms-2 my-3">
          <FormattedMessage
            id="app.backToUserPannel"
            defaultMessage="Back to user pannel"
          />
        </button>
      </NavLink>
      <div className="h-100 d-flex align-items-center justify-content-center">
        <div className="w-50">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                <FormattedMessage
                  id="app.email"
                  defaultMessage="Email address"
                />
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
              <label htmlFor="oldPassword" className="form-label">
                <FormattedMessage
                  id="app.oldPassword"
                  defaultMessage="Current password"
                />
              </label>
              <input
                type="password"
                placeholder={languageContext["app.oldPassword.placeholder"]}
                className={
                  touched.oldPassword
                    ? errors.oldPassword
                      ? "form-control is-invalid"
                      : "form-control is-valid"
                    : "form-control"
                }
                id="oldPassword"
                aria-describedby="oldPasswordHelp"
                value={values.oldPassword}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <div id="oldPasswordHelp" className="form-text">
                <FormattedMessage
                  id="app.oldPassword.help"
                  defaultMessage="Leave empty if you don't want to change your password or email"
                />
              </div>
              {touched.oldPassword && errors.oldPassword && (
                <div className="invalid-feedback">
                  {languageContext.errors[errors.oldPassword]}
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
                <FormattedMessage
                  id="app.lastName"
                  defaultMessage="Last name"
                />
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
            <button
              type="button"
              disabled={isSubmitting}
              className="btn btn-primary"
              onClick={handleSubmitButtonClick}
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
          {globalMessage !== "" && (
            <p className={success ? "text-success" : "text-danger"}>
              {success
                ? languageContext[globalMessage]
                : languageContext.errors[globalMessage]}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ModifyUser;
