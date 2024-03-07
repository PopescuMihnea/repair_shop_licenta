import { useFormik } from "formik";
import { FormattedMessage } from "react-intl";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { IAppointmentModify } from "../../interfaces/appointment/IAppointmentModify";
import { appointmentSchema } from "../../schemas/appointment";
import { IResponseForm } from "../../interfaces/response/IResponseForm";
import { NavLink } from "react-router-dom";
import { useLanguageContextMessages } from "../../context/language";

const AppointmentForm: React.FC = () => {
  const backendUri = import.meta.env.VITE_REACT_BACKEND_API;
  const { id } = useParams();
  const { queryString } = useLocation().state ? useLocation().state : "";
  const [globalMessage, setGlobalMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const languageContext: any = useLanguageContextMessages().language;
  let initialDate = new Date();
  initialDate.setDate(initialDate.getDate() + 7);

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
  } = useFormik<IAppointmentModify>({
    initialValues: {
      plateNumber: "",
      date: initialDate,
      _csrf: "",
    },
    validationSchema: appointmentSchema,
    onSubmit: async (values, actions): Promise<void> => {
      setSubmitting(true);
      const url = `${backendUri}/appointment/post/${id}`;
      console.log(values);
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      })
        .then(async (response) => {
          if (response.ok) {
            actions.resetForm();
            setSuccess(true);
            setGlobalMessage("Appointment created");
          } else if (response.status === 400) {
            setSuccess(false);
            setGlobalMessage("User currently logged in not found");
          } else if (response.status === 404) {
            setSuccess(false);
            setGlobalMessage("Repair shop for this appointment not found");
          } else if (response.status === 422) {
            const body: IResponseForm<IAppointmentModify> =
              await response.json();
            body.errors?.forEach((error) => {
              setFieldError(error.key, error.message);
            });
          } else if (response.status === 500) {
            setSuccess(false);
            setGlobalMessage("Error creating appointment");
          }
        })
        .catch((error) => console.error(error));
      setSubmitting(false);
    },
  });

  return (
    <>
      <div>
        <NavLink
          to={`/appointments/${id}/getAllUser`}
          state={{ queryString: queryString }}
        >
          <button type="button" className="btn btn-primary me-2 mt-3">
            <FormattedMessage
              id="app.backToYourAppointments"
              defaultMessage="Back to your appointments"
            />
          </button>
        </NavLink>
      </div>
      <div className=" mt-5 h-100 d-flex align-items-center justify-content-center">
        <div className="w-50">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="plateNumber" className="form-label">
                <FormattedMessage
                  id="app.plateNumber"
                  defaultMessage="Plate number"
                />
              </label>
              <input
                type="text"
                className={
                  touched.plateNumber
                    ? errors.plateNumber
                      ? "form-control is-invalid"
                      : "form-control is-valid"
                    : "form-control"
                }
                placeholder={
                  languageContext["app.plateNumber.appointment.placeholder"]
                }
                aria-describedby="plateNumberHelp"
                id="plateNumber"
                value={values.plateNumber}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <div id="plateNumberHelp" className="form-text">
                <p>
                  <FormattedMessage
                    id="app.plateNumber.appointment.help"
                    defaultMessage="Enter the plate number of the car you wish to make an
                  appointment for"
                  />
                </p>
              </div>
              {touched.plateNumber && errors.plateNumber && (
                <div className="invalid-feedback">
                  {languageContext.errors[errors.plateNumber]}
                </div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                <FormattedMessage id="app.date" defaultMessage="Date" />
              </label>
              <input
                type="date"
                placeholder={
                  languageContext["app.date.appointment.placeholder"]
                }
                className={
                  touched.date
                    ? errors.date
                      ? "form-control is-invalid"
                      : "form-control is-valid"
                    : "form-control"
                }
                id="date"
                value={values.date.toString()}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.date && errors.date && (
                <div className="invalid-feedback">
                  {languageContext.errors[errors.date as string]}
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

export default AppointmentForm;
