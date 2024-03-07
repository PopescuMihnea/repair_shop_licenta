import { useEffect, useState, useCallback } from "react";
import { IUser } from "../../interfaces/user/IUser";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/user";
import { NavLink } from "react-router-dom";
import { useLanguageContextMessages } from "../../context/language";
import { FormattedMessage } from "react-intl";

const User: React.FC = () => {
  const backendUri = import.meta.env.VITE_REACT_BACKEND_API;
  const [user, setUser] = useState<IUser | null>(null);
  const [resendCount, setResendCount] = useState(0);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendError, setResendError] = useState("");
  const [csrf, setCsrf] = useState("");
  const languageContext: any = useLanguageContextMessages().language;
  /*console.log(csrf);
  console.log(user);*/

  useEffect(() => {
    const getCsfr = async (): Promise<void> => {
      try {
        const url = `${backendUri}/csrf`;
        const res = await fetch(url, { credentials: "include" });
        const csrf: { csrfToken: string } = await res.json();
        setCsrf(csrf.csrfToken);
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

  const resendVerificationEmail = useCallback(() => {
    setResendingEmail(true);
    setResendError("");

    const url = `${backendUri}/auth/verify`;
    fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ _csrf: csrf }),
    })
      .then((response) => {
        if (response.ok) {
          setResendCount((prevCount) => prevCount + 1);
        } else if (response.status === 400) {
          setResendError("Email is already verified");
        } else {
          setResendError("Resending verification email failed.");
        }
      })
      .catch((error) => {
        console.error("Error resending verification email:", error);
        setResendError("Resending verification email failed.");
      })
      .finally(() => {
        setResendingEmail(false);
      });
  }, [backendUri, csrf]);

  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingUser, setDeletingUser] = useState(false);
  const navigate = useNavigate();
  const userContext = useUserContext();

  const handleDeleteButtonClick = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
    },
    []
  );

  const handleDelete = useCallback(() => {
    if (inputValue === "DELETE") {
      setDeleteError("");
      setDeletingUser(true);

      const url = `${backendUri}/user/delete`;
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
            userContext.actions.removeEmail();
            navigate("/login");
          } else {
            setDeleteError("Deleting user failed.");
          }
        })
        .catch((error) => {
          console.error("Error deleting user:", error);
          setDeleteError("Deleting user failed.");
        })
        .finally(() => {
          setDeletingUser(false);
        });
    } else {
      setDeleteError("You must type 'DELETE' to confirm");
    }
  }, [inputValue, backendUri, csrf]);

  return (
    <>
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id="app.userDeleteTitle"
              defaultMessage="Delete user confirmation"
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <FormattedMessage
              id="app.userDeleteConfirm"
              defaultMessage="Are you sure you want to delete the user?"
            />
          </p>
          <input
            type="text"
            className="form-control"
            value={inputValue}
            onChange={handleInputChange}
            aria-describedby="delete-help-text"
          />
          <div id="delete-help-text" className="input-group-text">
            <FormattedMessage
              id="app.userDelete.help"
              defaultMessage="Type 'DELETE' to confirm"
            />
          </div>
          {deleteError !== "" && <p className="text-danger">{deleteError}</p>}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={handleModalClose}>
            <FormattedMessage id="app.close" defaultMessage="Close" />
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={deletingUser}
          >
            {deletingUser ? (
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
      <div className="d-flex justify-content-center">
        <div className="my-5">
          <button
            type="button"
            onClick={handleDeleteButtonClick}
            className="btn btn-danger me-2"
          >
            <FormattedMessage
              id="app.deleteUser"
              defaultMessage="Delete user"
            />
          </button>
        </div>
        <NavLink to="/cars" className="my-5">
          <button type="button" className="btn btn-primary me-2">
            <FormattedMessage id="app.yourCars" defaultMessage="Your cars" />
          </button>
        </NavLink>
        <NavLink to="/user/modify" className="my-5">
          <button type="button" className="btn btn-primary">
            <FormattedMessage
              id="app.modifyAccountInfo"
              defaultMessage="Modify account information"
            />
          </button>
        </NavLink>
      </div>
      <div>
        {user && !user.verified && (
          <div className="alert alert-warning d-flex align-items-center">
            <div>
              <FormattedMessage
                id="app.verifyEmail"
                defaultMessage="You must verify your email."
              />
            </div>
            <div className="ms-auto">
              <button
                className="btn btn-primary"
                onClick={resendVerificationEmail}
                disabled={resendingEmail}
              >
                {resendingEmail ? (
                  <FormattedMessage
                    id="app.resendingVerificationEmail"
                    defaultMessage="Resending verification email..."
                  />
                ) : (
                  <FormattedMessage
                    id="app.resendVerificationEmail"
                    defaultMessage="Resend verification email"
                  />
                )}
              </button>
              {resendError !== "" && (
                <p className="mt-2">{languageContext.errors[resendError]}</p>
              )}
              {resendCount > 0 && (
                <p className="mt-2">
                  <FormattedMessage
                    id="app.verificationEmailResent"
                    defaultMessage={`Verification email resent ${resendCount} times.`}
                    values={{ resendCount: resendCount }}
                  />
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <div
        className="text-center border border-white rounded"
        style={{ fontFamily: "Garamond" }}
      >
        {user !== null && (
          <>
            <h2>
              <FormattedMessage
                id="app.accountInfo"
                defaultMessage="Account info :"
              />
            </h2>
            <p className="mt-3">
              <FormattedMessage id="app.email" defaultMessage="Email address" />
              : {user.email}
            </p>
            <p className="mt-3">
              <FormattedMessage
                id="app.firstName"
                defaultMessage="First name"
              />
              : {user.firstName}
            </p>
            <p className="mt-3">
              <FormattedMessage id="app.lastName" defaultMessage="Last name" />:{" "}
              {user.lastName}
            </p>
            <p className="mt-3">
              <FormattedMessage id="app.verified" defaultMessage="Verified" />:{" "}
              <span style={{ color: user.verified ? "green" : "red" }}>
                {user.verified ? (
                  <FormattedMessage id="app.yes" defaultMessage="Yes" />
                ) : (
                  <FormattedMessage id="app.no" defaultMessage="No" />
                )}
              </span>
            </p>
            <p className="mt-3">
              <FormattedMessage id="app.role" defaultMessage="Role" />:{" "}
              {user.role}
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default User;
