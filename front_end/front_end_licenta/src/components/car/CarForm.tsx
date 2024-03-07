import { useFormik } from "formik";
import { ICarModify } from "../../interfaces/car/ICarModify";
import { carSchema } from "../../schemas/car";
import { getJsFileExtension } from "../../helpers/getJsFileExtension";
import { FormattedMessage } from "react-intl";
import { useState, useCallback, useEffect } from "react";
import { ICar } from "../../interfaces/car/ICar";
import { IResponseForm } from "../../interfaces/response/IResponseForm";
import { IBlobFile } from "../../interfaces/IBlobFile";
import { useLocation, useParams } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { maxFileSize, mbToKb, colors, validFileTypes } from "../../consts";
import { NavLink } from "react-router-dom";
import { useLanguageContextMessages } from "../../context/language";

const CarForm: React.FC<{ post: boolean }> = ({ post }) => {
  let imageInput: HTMLInputElement | null = null;
  const { id } = post ? { id: "" } : useParams();
  const { queryString } = useLocation().state ? useLocation().state : "";
  const backendUri = import.meta.env.VITE_REACT_BACKEND_API;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [initialImageUrl, setInitialImageUrl] = useState("");
  const [initialImageData, setInitialImageData] = useState<IBlobFile | null>(
    null
  );
  const [globalMessage, setGlobalMessage] = useState("");
  const [resetImage, setResetImage] = useState(false);
  const [success, setSuccess] = useState(false);
  const [car, setCar] = useState<ICar | null>(null);
  const [csrf, setCsrf] = useState("");
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
          setCar(car);

          if (car.image) {
            const url = URL.createObjectURL(
              new Blob([new Uint8Array(car.image.data)], {
                type: `image/${car.image.type.slice(1)}`,
              })
            );
            setInitialImageUrl(url);
            setInitialImageData(car.image);
            setSelectedImage(url);
          }

          setGlobalMessage("");
        } else if (res.status === 404) {
          setGlobalMessage("Car not found");
        } else if (res.status === 500) {
          setGlobalMessage("Error getting car");
        }
      } catch (error) {
        console.error("Error fetching car:", error);
      }
    };

    getCsfr();
    if (!post) {
      getCar();
    }
  }, [backendUri]);

  const {
    values,
    errors,
    submitForm,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldError,
    setFieldValue,
    touched,
    isSubmitting,
    setSubmitting,
  } = useFormik<ICarModify>({
    initialValues: {
      image: undefined,
      plateNumber: car ? car.plateNumber : "",
      VIN: car ? car.VIN : "",
      color: car ? car.color : colors[0],
      _csrf: csrf,
    },
    enableReinitialize: true,
    validationSchema: carSchema,
    onSubmit: async (values, actions): Promise<void> => {
      setSubmitting(true);
      setSuccess(false);
      setGlobalMessage("");
      handleModalClose();
      setResetImage(false);

      let image: IBlobFile | undefined = undefined;
      if (values.image) {
        const imageData = new Uint8Array(await values.image.arrayBuffer());

        image = {
          data: Array.from(imageData),
          type: getJsFileExtension(values.image.name),
        };
      } else if (initialImageData) {
        image = initialImageData;
      }

      const carJson: ICar = {
        plateNumber: values.plateNumber,
        color: values.color,
        VIN: values.VIN,
        image: image,
        _csrf: values._csrf,
      };

      console.log(carJson);

      const url = `${backendUri}/car/${post ? "post" : `put/${id}`}`;
      await fetch(url, {
        method: post ? "POST" : "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(carJson),
      })
        .then(async (response) => {
          if (response.ok) {
            setSuccess(true);

            if (post) {
              actions.resetForm();
            } else {
              if (image) {
                if (initialImageUrl) {
                  URL.revokeObjectURL(initialImageUrl);
                }

                const url = URL.createObjectURL(
                  new Blob([new Uint8Array(image.data)], {
                    type: `image/${image.type.slice(1)}`,
                  })
                );
                setInitialImageUrl(url);
                setInitialImageData(image);
                setSelectedImage(url);
              }
            }

            setGlobalMessage(
              post ? "Car succesfully created" : "Car succesfully updated"
            );
          } else if (response.status === 400) {
            setGlobalMessage("User not found");
          } else if (response.status === 404) {
            setGlobalMessage("Car not found");
          } else if (response.status === 422) {
            const body: IResponseForm<ICar> = await response.json();
            body.errors?.forEach((error) => {
              if (error.key !== "index") {
                setFieldError(error.key, error.message);
              } else {
                if (error.message.includes("plateNumber")) {
                  setFieldError("plateNumber", "Plate number already exists");
                } else if (error.message.includes("VIN")) {
                  setFieldError("VIN", "VIN already exists");
                } else {
                  console.log("validation error", error);
                }
              }
            });
          } else {
            setGlobalMessage(
              post ? "Error creating car" : "Error updating car"
            );
          }
        })
        .catch((error) => console.error(error));
      setSubmitting(false);
    },
  });

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.currentTarget != null && event.currentTarget.files != null) {
        setFieldValue("image", event.currentTarget.files[0]);
      }

      const file = event!.currentTarget!.files![0];

      if (file && validFileTypes.includes(getJsFileExtension(file.name))) {
        if (selectedImage && selectedImage !== initialImageUrl) {
          URL.revokeObjectURL(selectedImage);
        }

        setSelectedImage(URL.createObjectURL(file));
      } else {
        if (post) {
          setSelectedImage(null);
        } else {
          setSelectedImage(initialImageUrl);
        }
      }
    },
    [selectedImage, initialImageUrl]
  );

  useEffect(() => {
    if (success && !resetImage && post) {
      if (selectedImage !== null) {
        URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
      }
      if (imageInput !== null) {
        imageInput.value = "";
      }
      setResetImage(true);
    }
  }, [success, selectedImage, resetImage]);

  const [showModal, setShowModal] = useState(false);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleSubmitButtonClick = useCallback(() => {
    setShowModal(true);
  }, []);

  return (
    <>
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id="app.carModifyTitle"
              defaultMessage="Modify car confirmation"
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormattedMessage
            id="app.carModifyConfirm"
            defaultMessage="Are you sure you want to modify the car?"
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
      {car || post ? (
        <div className="h-100 d-flex flex-column align-items-center justify-content-center">
          {!post && (
            <NavLink to={`/cars/${id}`} state={{ queryString: queryString }}>
              <button type="button" className="btn btn-primary me-2 mt-3">
                <FormattedMessage
                  id="app.backToCar"
                  defaultMessage="Back to car view"
                />
              </button>
            </NavLink>
          )}
          <div className="mb-4">
            {selectedImage && (
              <div className="text-center">
                <img
                  src={selectedImage}
                  alt="Car image"
                  className="img-thumbnail mt-3"
                  style={{ maxHeight: "200px" }}
                />
              </div>
            )}
          </div>
          <div className="w-50">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="image" className="form-label">
                  <FormattedMessage
                    id="app.carImage"
                    defaultMessage={`Car image (${validFileTypes.join(", ")})`}
                    values={{ imageFormats: validFileTypes.join(", ") }}
                  />
                </label>
                <input
                  className={
                    touched.image
                      ? errors.image
                        ? "form-control is-invalid"
                        : "form-control is-valid"
                      : "form-control"
                  }
                  type="file"
                  onChange={(event) => handleFileChange(event)}
                  onBlur={handleBlur}
                  ref={(ref) => (imageInput = ref)}
                  id="image"
                  aria-describedby="imageHelp"
                />
                <div id="imageHelp" className="form-text d-flex flex-column">
                  <p>
                    <FormattedMessage
                      id="app.image.help1"
                      defaultMessage={`Supported image file types are: ${validFileTypes.join(
                        ", "
                      )}`}
                      values={{ imageFormats: validFileTypes.join(", ") }}
                    />
                  </p>
                  <p className="mt-2">
                    <FormattedMessage
                      id="app.image.help2"
                      defaultMessage={`File size can't exceed ${
                        maxFileSize * mbToKb
                      } MB`}
                      values={{ imageSize: maxFileSize * mbToKb }}
                    />
                  </p>
                </div>
                {touched.image && errors.image && (
                  <div className="invalid-feedback">
                    {languageContext.errors[errors.image]}
                  </div>
                )}
              </div>
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
                  placeholder={languageContext["app.plateNumber.placeholder"]}
                  id="plateNumber"
                  value={values.plateNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.plateNumber && errors.plateNumber && (
                  <div className="invalid-feedback">
                    {languageContext.errors[errors.plateNumber]}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="VIN" className="form-label">
                  <FormattedMessage
                    id="app.vin"
                    defaultMessage="VIN (Vehicle Identification Number)"
                  />
                </label>
                <input
                  type="text"
                  className={
                    touched.VIN
                      ? errors.VIN
                        ? "form-control is-invalid"
                        : "form-control is-valid"
                      : "form-control"
                  }
                  style={!post ? { backgroundColor: "#cccccc" } : {}}
                  placeholder={languageContext["app.vin.placeholder"]}
                  id="VIN"
                  aria-describedby="VINHelp"
                  value={values.VIN}
                  disabled={!post}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <div id="VINHelp" className="form-text">
                  <p>
                    <FormattedMessage
                      id="app.vin.help"
                      defaultMessage="The VIN is found in your car identity book and is 17
                    characters long"
                    />
                  </p>
                </div>
                {touched.VIN && errors.VIN && (
                  <div className="invalid-feedback">
                    {languageContext.errors[errors.VIN]}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="color" className="form-label">
                  <FormattedMessage id="app.color" defaultMessage="Color" />
                </label>
                <select
                  id="color"
                  aria-describedby="colorHelp"
                  value={values.color}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    touched.color
                      ? errors.color
                        ? "form-select is-invalid"
                        : "form-select is-valid"
                      : "form-select"
                  }
                >
                  {colors.map((color, index) => {
                    return (
                      <option value={color} key={index}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </option>
                    );
                  })}
                </select>
                <div id="colorHelp" className="form-text">
                  <p>
                    <FormattedMessage
                      id="app.color.help"
                      defaultMessage="The color specified in your car identity book"
                    />
                  </p>
                </div>
                {touched.color && errors.color && (
                  <div className="invalid-feedback">
                    {languageContext.errors[errors.color]}
                  </div>
                )}
              </div>
              <button
                type={post ? "submit" : "button"}
                disabled={isSubmitting}
                onClick={post ? undefined : handleSubmitButtonClick}
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
      ) : (
        <p>{languageContext.errors[globalMessage]}</p>
      )}
    </>
  );
};

export default CarForm;
