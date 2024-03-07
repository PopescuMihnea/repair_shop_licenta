import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ICar } from "../../interfaces/car/ICar";
import { Modal } from "react-bootstrap";
import { useLanguageContextMessages } from "../../context/language";
import { FormattedMessage } from "react-intl";
import { useLocation } from "react-router-dom";

const Car: React.FC = () => {
  const backendUri = import.meta.env.VITE_REACT_BACKEND_API;
  const [csrf, setCsrf] = useState("");
  const [car, setCar] = useState<ICar | null>(null);
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

    const getCar = async (): Promise<void> => {
      try {
        const url = `${backendUri}/car/get/${id}`;
        const res = await fetch(url, { credentials: "include" });
        if (res.ok) {
          const car: ICar = await res.json();
          console.log(car);
          setCar(car);
        } else if (res.status === 404) {
          setGetErrorMessage("Car not found");
        } else if (res.status === 500) {
          setGetErrorMessage("Error getting car");
        }
      } catch (error) {
        console.error("Error fetching car:", error);
      }
    };

    getCsfr();
    getCar();
  }, [backendUri]);

  const [showModal, setShowModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deletingCar, setDeletingCar] = useState(false);

  const navigate = useNavigate();

  const handleCarDelete = useCallback(() => {
    setDeleteError("");
    setDeletingCar(true);

    const url = `${backendUri}/car/delete/${id}`;
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
          navigate("/cars");
        } else {
          setDeleteError("Deleting car failed.");
        }
      })
      .catch((error) => {
        console.error("Error deleting car:", error);
        setDeleteError("Deleting car failed.");
      })
      .finally(() => {
        setDeletingCar(false);
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
              id="app.deleteCarTitle"
              defaultMessage="Delete car confirmation"
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <FormattedMessage
              id="app.deleteCarConfirm"
              defaultMessage="Are you sure you want to delete this car?"
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
            disabled={deletingCar}
            onClick={handleCarDelete}
          >
            {deletingCar ? (
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
      {car ? (
        <div>
          <NavLink to={`/cars${queryString ? `${queryString}` : ""}`}>
            <button type="button" className="btn btn-primary me-2 mt-3">
              <FormattedMessage
                id="app.backToCars"
                defaultMessage="Back to your cars"
              />
            </button>
          </NavLink>
          <div className="d-flex justify-content-center align-contenr-center">
            <div className="border rounded border-white w-75 mt-4">
              <div className="row">
                <div className="col-4">
                  {car.image ? (
                    <img
                      src={URL.createObjectURL(
                        new Blob([new Uint8Array(car.image.data)], {
                          type: `image/${car.image.type.slice(1)}`,
                        })
                      )}
                      alt="Car image"
                      className="img-fluid p-3"
                      style={{ maxWidth: "100%" }}
                    />
                  ) : (
                    <img
                      alt="Unknown car"
                      src="/unknownCar.jpg"
                      className="img-fluid p-3"
                      style={{ maxWidth: "100%" }}
                    />
                  )}
                </div>
                <div className="col-8">
                  <div className="row h-100">
                    <div>
                      <h3>
                        <FormattedMessage
                          id="app.plateNumber"
                          defaultMessage="Plate number"
                        />
                        : {car.plateNumber}
                      </h3>
                      <p className="mt-3">VIN: {car.VIN}</p>
                      <p>
                        <FormattedMessage
                          id="app.color"
                          defaultMessage="Color"
                        />
                        : {car.color}
                      </p>
                    </div>
                    <div className="d-flex justify-content-between align-self-end mb-3">
                      <NavLink
                        to={`/cars/put/${id}`}
                        state={{ queryString: queryString }}
                      >
                        <button className="btn btn-primary">
                          <FormattedMessage
                            id="app.modify"
                            defaultMessage="Modify"
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

export default Car;
