import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Modal } from "react-bootstrap";
import { IRepairShop } from "../../interfaces/repairShop/IRepairShop";
import { useLanguageContextMessages } from "../../context/language";
import { FormattedMessage } from "react-intl";

const RepairShop: React.FC<{ isManager: boolean }> = ({ isManager }) => {
  const backendUri = import.meta.env.VITE_REACT_BACKEND_API;
  const [csrf, setCsrf] = useState("");
  const [repairShop, setRepairShop] = useState<IRepairShop | null>(null);
  const [errorMessage, setGetErrorMessage] = useState("");
  const { id } = useParams();
  const { queryString } = useLocation().state ? useLocation().state : "";
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

    const getRepairShop = async (): Promise<void> => {
      try {
        const url = `${backendUri}/repairShop/${
          isManager ? "get" : "getUser"
        }/${id}`;
        const res = await fetch(url, { credentials: "include" });
        if (res.ok) {
          const repairShop: IRepairShop = await res.json();
          console.log(repairShop);
          setRepairShop(repairShop);
        } else if (res.status === 404) {
          setGetErrorMessage("Repair shop not found");
        } else if (res.status === 500) {
          setGetErrorMessage("Error getting repair shop");
        }
      } catch (error) {
        console.error("Error fetching repair shop:", error);
      }
    };

    getCsfr();
    getRepairShop();
  }, [backendUri]);

  const [showModal, setShowModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deletingRepairShop, setDeletingRepairShop] = useState(false);

  const navigate = useNavigate();

  const handleRepairShopDelete = useCallback(() => {
    setDeleteError("");
    setDeletingRepairShop(true);

    const url = `${backendUri}/repairShop/delete/${id}`;
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
          navigate("/repairShops");
        } else {
          setDeleteError("Deleting repair shop failed.");
        }
      })
      .catch((error) => {
        console.error("Error deleting repair shop:", error);
        setDeleteError("Deleting repair shop failed.");
      })
      .finally(() => {
        setDeletingRepairShop(false);
      });
  }, [id, backendUri, csrf]);

  const handleDeleteButtonClick = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
    <>
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id="app.deleteRepairShopTitle"
              defaultMessage="Delete repair shop confirmation"
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <FormattedMessage
              id="app.deleteRepariShopConfirm"
              defaultMessage="Are you sure you want to delete this repair shop?"
            />
          </p>
          {deleteError !== "" && (
            <p className="text-danger">{languageContext.errors[deleteError]}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={handleModalClose}>
            <FormattedMessage id="app.close" defaultMessage="Close" />
          </button>
          <button
            className="btn btn-danger"
            disabled={deletingRepairShop}
            onClick={handleRepairShopDelete}
          >
            {deletingRepairShop ? (
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
      {repairShop ? (
        <div>
          <NavLink
            to={
              isManager
                ? `/repairShops${queryString ? `${queryString}` : ""}`
                : `/repairShopsAll${queryString ? `${queryString}` : ""}`
            }
          >
            <button type="button" className="btn btn-primary me-2 mt-3">
              {isManager ? (
                <FormattedMessage
                  id="app.backToYourRepairShops"
                  defaultMessage="Back to your repair shops"
                />
              ) : (
                <FormattedMessage
                  id="app.backToRepairShops"
                  defaultMessage="Back to repair shops"
                />
              )}
            </button>
          </NavLink>
          <div className="d-flex justify-content-center align-contenr-center">
            <div className="border rounded border-white w-75 mt-4">
              <div className="row">
                <div className="col-4">
                  {repairShop.image ? (
                    <img
                      src={URL.createObjectURL(
                        new Blob([new Uint8Array(repairShop.image.data)], {
                          type: `image/${repairShop.image.type.slice(1)}`,
                        })
                      )}
                      alt="Repair shop image"
                      className="img-fluid p-3"
                      style={{ maxWidth: "100%" }}
                    />
                  ) : (
                    <img
                      alt="Unknown repair shop"
                      src="/unknownRepairShop.jpg"
                      className="img-fluid p-3"
                      style={{ maxWidth: "100%" }}
                    />
                  )}
                </div>
                <div className="col-8">
                  <div className="row h-100">
                    <div>
                      <h3>
                        <FormattedMessage id="app.name" defaultMessage="Name" />
                        : {repairShop.name}
                      </h3>
                      {!isManager && (
                        <p>
                          <FormattedMessage
                            id="app.ownerEmail"
                            defaultMessage="Owner email"
                          />
                          : {repairShop.userEmail}
                        </p>
                      )}
                      <p>
                        <FormattedMessage
                          id="app.street"
                          defaultMessage="Street"
                        />
                        : {repairShop.address.street}
                      </p>
                      <p>
                        <FormattedMessage id="app.city" defaultMessage="City" />
                        : {repairShop.address.city}
                      </p>
                      <p>
                        <FormattedMessage
                          id="app.county"
                          defaultMessage="County"
                        />
                        : {repairShop.address.county}
                      </p>
                    </div>
                    <div className="d-flex justify-content-between align-self-end mb-3">
                      {isManager && (
                        <>
                          <NavLink
                            to={`/repairShops/put/${id}`}
                            state={{ queryString: queryString }}
                          >
                            <button className="btn btn-primary">
                              <FormattedMessage
                                id="app.modify"
                                defaultMessage="Modify"
                              />
                            </button>
                          </NavLink>
                          <NavLink
                            to={`/appointments/${id}/getAllManager`}
                            state={{
                              queryString: queryString,
                            }}
                          >
                            <button className="btn btn-primary">
                              <FormattedMessage
                                id="app.viewAppointments"
                                defaultMessage="View appointments"
                              />
                            </button>
                          </NavLink>
                          <button
                            className="btn btn-danger me-3"
                            onClick={handleDeleteButtonClick}
                          >
                            <FormattedMessage
                              id="app.delete"
                              defaultMessage="Delete"
                            />
                          </button>
                        </>
                      )}
                      {!isManager && (
                        <>
                          <NavLink
                            to={`/appointments/post/${id}`}
                            state={{ queryString: queryString }}
                          >
                            <button className="btn btn-primary">
                              <FormattedMessage
                                id="app.scheduleAppointment"
                                defaultMessage="Schedule an appointment"
                              />
                            </button>
                          </NavLink>
                          <NavLink
                            to={`/appointments/${id}/getAllUser`}
                            state={{
                              queryString: queryString,
                            }}
                          >
                            <button className="btn btn-primary">
                              <FormattedMessage
                                id="app.viewYourAppointments"
                                defaultMessage="View your appointments"
                              />
                            </button>
                          </NavLink>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>{languageContext.errors[errorMessage]}</p>
      )}
    </>
  );
};

export default RepairShop;
