import { useFormik } from "formik";
import { getJsFileExtension } from "../../helpers/getJsFileExtension";
import { FormattedMessage } from "react-intl";
import { useState, useCallback, useEffect } from "react";
import { IResponseForm } from "../../interfaces/response/IResponseForm";
import { IBlobFile } from "../../interfaces/IBlobFile";
import { useLocation, useParams } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { IRepairShop } from "../../interfaces/repairShop/IRepairShop";
import { IRepairShopModify } from "../../interfaces/repairShop/IRepairShopModify";
import { repairShopSchema } from "../../schemas/repairShop";
import { maxFileSize, mbToKb, counties, validFileTypes } from "../../consts";
import { NavLink } from "react-router-dom";
import { useLanguageContextMessages } from "../../context/language";

const RepairShopForm: React.FC<{ post: boolean }> = ({ post }) => {
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
  const [repairShop, setRepairShop] = useState<IRepairShop | null>(null);
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
    const getRepairShop = async (): Promise<void> => {
      try {
        const url = `${backendUri}/repairShop/get/${id}`;
        const res = await fetch(url, { credentials: "include" });
        if (res.ok) {
          const repairShop: IRepairShop = await res.json();
          setRepairShop(repairShop);

          if (repairShop.image) {
            const url = URL.createObjectURL(
              new Blob([new Uint8Array(repairShop.image.data)], {
                type: `image/${repairShop.image.type.slice(1)}`,
              })
            );
            setInitialImageUrl(url);
            setInitialImageData(repairShop.image);
            setSelectedImage(url);
          }

          setGlobalMessage("");
        } else if (res.status === 404) {
          setGlobalMessage("Repair shop not found");
        } else if (res.status === 500) {
          setGlobalMessage("Error getting repair shop");
        }
      } catch (error) {
        console.error("Error fetching repair shop:", error);
      }
    };

    getCsfr();
    if (!post) {
      getRepairShop();
    }
    console.log(errors.address);
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
  } = useFormik<IRepairShopModify>({
    initialValues: {
      image: undefined,
      name: repairShop ? repairShop.name : "",
      address: repairShop
        ? repairShop.address
        : { city: "", street: "", county: counties[0] },
      _csrf: csrf,
    },
    enableReinitialize: true,
    validationSchema: repairShopSchema,
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

      const repairShopJson: IRepairShop = {
        name: values.name,
        address: values.address,
        image: image,
        _csrf: values._csrf,
      };

      console.log(repairShopJson);

      const url = `${backendUri}/repairShop/${post ? "post" : `put/${id}`}`;
      await fetch(url, {
        method: post ? "POST" : "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(repairShopJson),
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
              post
                ? "Repair shop succesfully created"
                : "Repair shop succesfully updated"
            );
          } else if (response.status === 400) {
            setGlobalMessage("User not found");
          } else if (response.status === 404) {
            setGlobalMessage("Repair shop not found");
          } else if (response.status === 422) {
            const body: IResponseForm<IRepairShop> = await response.json();
            body.errors?.forEach((error) => {
              if (Object.keys(values.address).includes(error.key)) {
                setFieldError(`address.${error.key}`, error.message);
              } else if (error.key !== "index") {
                setFieldError(error.key, error.message);
              } else {
                setFieldError("name", "Name already exists");
              }
            });
          } else {
            setGlobalMessage(
              post ? "Error creating repair shop" : "Error updating repair shop"
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
              id="app.modifyRepairShopTitle"
              defaultMessage="Modify repair shop confirmation"
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormattedMessage
            id="app.modifyRepairShopConfirm"
            defaultMessage="Are you sure you want to modify the repair shop?"
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
      {repairShop || post ? (
        <div className="h-100 d-flex flex-column align-items-center justify-content-center">
          {!post && (
            <NavLink
              to={`/repairShops/${id}`}
              state={{ queryString: queryString }}
            >
              <button type="button" className="btn btn-primary me-2 mt-3">
                <FormattedMessage
                  id="app.backToRepairShopView"
                  defaultMessage="Back to repair shop view"
                />
              </button>
            </NavLink>
          )}
          <div className="mb-4">
            {selectedImage && (
              <div className="text-center">
                <img
                  src={selectedImage}
                  alt="Repair shop image"
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
                    id="app.repairShopImage"
                    defaultMessage={`Repair shop image (${validFileTypes.join(
                      ", "
                    )})`}
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
                <label htmlFor="name" className="form-label">
                  <FormattedMessage id="app.name" defaultMessage="Name" />
                </label>
                <input
                  type="text"
                  className={
                    touched.name
                      ? errors.name
                        ? "form-control is-invalid"
                        : "form-control is-valid"
                      : "form-control"
                  }
                  placeholder={languageContext["app.name.placeholder"]}
                  id="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.name && errors.name && (
                  <div className="invalid-feedback">
                    {languageContext.errors[errors.name]}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="address.street" className="form-label">
                  <FormattedMessage id="app.street" defaultMessage="Street" />
                </label>
                <input
                  type="text"
                  className={
                    touched.address?.street
                      ? errors.address?.street
                        ? "form-control is-invalid"
                        : "form-control is-valid"
                      : "form-control"
                  }
                  placeholder={languageContext["app.street.placeholder"]}
                  id="address.street"
                  value={values.address.street}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.address?.street && errors.address?.street && (
                  <div className="invalid-feedback">
                    {languageContext.errors[errors.address.street]}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="address.city" className="form-label">
                  <FormattedMessage id="app.city" defaultMessage="City" />
                </label>
                <input
                  type="text"
                  className={
                    touched.address?.city
                      ? errors.address?.city
                        ? "form-control is-invalid"
                        : "form-control is-valid"
                      : "form-control"
                  }
                  placeholder={languageContext["app.city.placeholder"]}
                  id="address.city"
                  value={values.address.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.address?.city && errors.address?.city && (
                  <div className="invalid-feedback">
                    {languageContext.errors[errors.address.city]}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="address.county" className="form-label">
                  <FormattedMessage id="app.county" defaultMessage="County" />
                </label>
                <select
                  id="address.county"
                  value={values.address.county}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    touched.address?.county
                      ? errors.address?.county
                        ? "form-select is-invalid"
                        : "form-select is-valid"
                      : "form-select"
                  }
                >
                  {counties.map((county, index) => {
                    return (
                      <option value={county} key={index}>
                        {county}
                      </option>
                    );
                  })}
                </select>
                {errors.address?.county && (
                  <div className="invalid-feedback">
                    {languageContext.errors[errors.address.county]}
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

export default RepairShopForm;
