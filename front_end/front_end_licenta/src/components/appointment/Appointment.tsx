import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { IRepairShop } from "../../interfaces/repairShop/IRepairShop";
import { IAppointment } from "../../interfaces/appointment/IAppointment";
import { ICar } from "../../interfaces/car/ICar";
import { Status } from "../../enums/status";
import { useLanguageContextMessages } from "../../context/language";
import { FormattedMessage } from "react-intl";
import { NavLink } from "react-router-dom";

const Appointment: React.FC<{ isManager: boolean }> = ({ isManager }) => {
  const backendUri = import.meta.env.VITE_REACT_BACKEND_API;
  const [csrf, setCsrf] = useState("");
  const [appointment, setAppointment] = useState<IAppointment | null>(null);
  const [getErrorMessage, setGetErrorMessage] = useState("");
  const [reload, setReload] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const languageContext: any = useLanguageContextMessages().language;
  const { id } = useParams();
  const { queryString } = useLocation().state ? useLocation().state : "";
  const { resourceId } = useLocation().state ? useLocation().state : "";
  const statusColor = useMemo(() => {
    if (appointment) {
      switch (appointment!.status) {
        case Status[Status.Pending]:
          return "orange";
        case Status[Status.Denied]:
          return "red";
        case Status[Status.Accepted]:
          return "green";
        case Status[Status.Completed]:
          return "darkgreen";
        default:
          return "";
      }
    }

    return "";
  }, [appointment]);

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

    const getAppointment = async (): Promise<void> => {
      try {
        const url = `${backendUri}/appointment/${
          isManager ? "getManager" : "get"
        }/${id}`;
        console.log(url);
        const res = await fetch(url, { credentials: "include" });
        if (res.ok) {
          const appointment: IAppointment = await res.json();
          console.log(appointment);
          setAppointment(appointment);
          setDate(new Date(appointment.date));
        } else if (res.status === 404 || 400) {
          setGetErrorMessage("Appointment not found");
        } else if (res.status === 500) {
          setGetErrorMessage("Error getting appointment");
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
      }
    };

    getCsfr();
    getAppointment();
  }, [backendUri, reload]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deletingAppointment, setDeletingAppointment] = useState(false);

  const [showModifyModel, setShowModifyModal] = useState(false);
  const [modifyError, setModifyError] = useState("");
  const [modifyingAppointment, setModifyingAppointment] = useState(false);
  const [modifyType, setModifyType] = useState("");

  const navigate = useNavigate();

  const handleAppointmentDelete = useCallback(() => {
    setDeleteError("");
    setDeletingAppointment(true);

    const url = `${backendUri}/appointment/delete/${id}`;
    fetch(url, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ _csrf: csrf }),
    })
      .then((response) => {
        if (response.ok) {
          navigate("/repairShopsAll");
        } else {
          setDeleteError("Deleting appointment failed.");
        }
      })
      .catch((error) => {
        console.error("Error deleting appointment:", error);
        setDeleteError("Deleting appointment failed.");
      })
      .finally(() => {
        setDeletingAppointment(false);
      });
  }, [id, backendUri, csrf]);

  const handleAppointmentModify = useCallback(() => {
    setModifyError("");
    setModifyingAppointment(true);

    const url = `${backendUri}/appointment/${modifyType}/${id}`;
    fetch(url, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ _csrf: csrf }),
    })
      .then((response) => {
        if (response.ok) {
          setReload(true);
          handleModifyModalClose();
        } else {
          setModifyError("Modifying appointment failed.");
        }
      })
      .catch((error) => {
        console.error("Error deleting modifying appointment: ", error);
        setModifyError("Modifying appointment failed.");
      })
      .finally(() => {
        setModifyingAppointment(false);
      });
  }, [id, backendUri, csrf, modifyType]);

  const handleDeleteButtonClick = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleDeleteModalClose = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  const handleAcceptButtonClick = useCallback(() => {
    setModifyType("accept");
    setShowModifyModal(true);
  }, []);

  const handleDenyButtonClick = useCallback(() => {
    setModifyType("deny");
    setShowModifyModal(true);
  }, []);

  const handleModifyModalClose = useCallback(() => {
    setShowModifyModal(false);
  }, []);

  return (
    <>
      <Modal show={showModifyModel} onHide={handleModifyModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id={`app.${modifyType}Title`}
              defaultMessage={`${modifyType} appointment confirmation`}
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormattedMessage
            id={`app.${modifyType}Confirm`}
            defaultMessage={`Are you sure you want to ${modifyType} this appointment?`}
          />
          {modifyError !== "" && (
            <p className="text-danger">{languageContext.errors[modifyError]}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={handleModifyModalClose}
          >
            <FormattedMessage id="app.close" defaultMessage="Close" />
          </button>
          <button
            className="btn btn-danger"
            disabled={modifyingAppointment}
            onClick={handleAppointmentModify}
          >
            {modifyingAppointment ? (
              <FormattedMessage
                id="app.modifying"
                defaultMessage="Modifying..."
              />
            ) : (
              <FormattedMessage id="app.modify" defaultMessage="Modify" />
            )}
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleDeleteModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id="app.appointmentDeleteTitle"
              defaultMessage="Delete appointment confirmation"
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <FormattedMessage
              id="app.appointmentDeleteConfirm"
              defaultMessage="Are you sure you want to delete this appointment?"
            />
          </p>
          {deleteError !== "" && (
            <p className="text-danger">{languageContext.errors[deleteError]}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={handleDeleteModalClose}
          >
            <FormattedMessage id="app.close" defaultMessage="Close" />
          </button>
          <button
            className="btn btn-danger"
            disabled={deletingAppointment}
            onClick={handleAppointmentDelete}
          >
            {deletingAppointment ? (
              <FormattedMessage
                id="app.deleting"
                defaultMessage="Deleting..."
              />
            ) : (
              <FormattedMessage id="app.delete" defaultMessage="Delete" />
            )}
          </button>
        </Modal.Footer>
      </Modal>
      {appointment ? (
        <div>
          {resourceId && resourceId !== "" && (
            <NavLink
              to={
                isManager
                  ? `/appointments/${resourceId}/getAllManager${
                      queryString ? `${queryString}` : ""
                    }`
                  : `/appointments/${resourceId}/getAllUser${
                      queryString ? `${queryString}` : ""
                    }`
              }
            >
              <button type="button" className="btn btn-primary me-2 mt-3">
                {isManager ? (
                  <FormattedMessage
                    id="app.backToAppointments"
                    defaultMessage="Back to appointments"
                  />
                ) : (
                  <FormattedMessage
                    id="app.backToYourAppointments"
                    defaultMessage="Back to your appointments"
                  />
                )}
              </button>
            </NavLink>
          )}
          <div className="d-flex justify-content-center align-contenr-center">
            <div className="border rounded border-white w-75 mt-4">
              <div className="row">
                <div className="col-12">
                  <div className="row h-100">
                    <div className="ms-3">
                      <h3>
                        <FormattedMessage id="app.date" defaultMessage="Date" />
                        :
                        {date!.getDate() +
                          "/" +
                          (date!.getMonth() + 1) +
                          "/" +
                          date!.getFullYear()}
                      </h3>
                      <p>
                        <FormattedMessage
                          id="app.plateNumber"
                          defaultMessage="Plate number"
                        />
                        :{(appointment.car! as ICar).plateNumber}
                      </p>
                      {isManager && (
                        <p>
                          <FormattedMessage
                            id="app.userEmail"
                            defaultMessage="User email"
                          />
                          :{(appointment.car! as ICar).user!.email}
                        </p>
                      )}
                      {!isManager && (
                        <>
                          <p>
                            <FormattedMessage
                              id="app.repairShopName"
                              defaultMessage="Repair shop name"
                            />
                            :{(appointment.repairShop! as IRepairShop).name}
                          </p>
                          <p>
                            <FormattedMessage
                              id="app.owerEmail"
                              defaultMessage="Owner email"
                            />
                            :
                            {
                              (appointment.repairShop! as IRepairShop).user!
                                .email
                            }
                          </p>
                        </>
                      )}
                      <p style={{ color: statusColor }}>
                        <FormattedMessage
                          id="app.status"
                          defaultMessage="Status"
                        />
                        :
                        <FormattedMessage
                          id={`app.status${appointment.status}`}
                        />
                      </p>
                    </div>
                    <div className="d-flex justify-content-around align-self-end mb-3">
                      {isManager &&
                        appointment.status === Status[Status.Pending] && (
                          <>
                            <button
                              className="btn btn-success"
                              onClick={handleAcceptButtonClick}
                            >
                              <FormattedMessage
                                id="app.approve"
                                defaultMessage="Approve"
                              />
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={handleDenyButtonClick}
                            >
                              <FormattedMessage
                                id="app.deny"
                                defaultMessage="Deny"
                              />
                            </button>
                          </>
                        )}
                      {!isManager &&
                        appointment.status === Status[Status.Pending] && (
                          <button
                            className="btn btn-danger me-3"
                            onClick={handleDeleteButtonClick}
                          >
                            <FormattedMessage
                              id="app.delete"
                              defaultMessage="Delete"
                            />
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>{languageContext.errors[getErrorMessage]}</p>
      )}
    </>
  );
};

export default Appointment;
