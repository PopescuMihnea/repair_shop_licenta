import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useLanguageContext } from "../context/language";
import { FormattedMessage } from "react-intl";
import Dropdown from "react-bootstrap/Dropdown";
import Languages from "../i18n/languages.json";
import { useUserContext } from "../context/user";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import { useCallback } from "react";
import { findCookie } from "../helpers/findCookie";
import { Roles } from "../enums/roles";
import { userCookieName } from "../consts";

const NavigationBar: React.FC = () => {
  const userContext = useUserContext();
  const languageContext = useLanguageContext();

  const cookieRole: any = findCookie(userCookieName);
  const userRole: number = parseInt(Roles[cookieRole]);
  //console.log("userRole in nav", userRole);

  const userEmail = userContext.email;
  const navigate = useNavigate();

  const backendUri = import.meta.env.VITE_REACT_BACKEND_API;
  const logout = useCallback(async (): Promise<void> => {
    const url = `${backendUri}/logout`;
    await fetch(url, {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          userContext.actions.removeEmail();
          navigate("/");
        }
      })
      .catch((error) => console.error(error));
  }, [userEmail, backendUri, navigate]);

  return (
    <>
      <header className="sticky-top">
        <nav className="navbar sticky-top navbar-expand-lg navbar-dark bg-dark bg-gradient border-bottom border-white">
          <div className="container-fluid">
            <div className="d-flex">
              <img
                alt="FMI logo"
                src="/FMI_logo.png"
                style={{ maxHeight: "100px", maxWidth: "200px" }}
                className="img-fluid me-2"
              />
              <p className="navbar-brand">Cars</p>
            </div>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNavAltMarkup"
              aria-controls="navbarNavAltMarkup"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
              <div className="navbar-nav ms-auto">
                <NavLink
                  className="w-100 me-5 mt-lg-0 mt-3"
                  to="/repairShopsAll"
                >
                  {({ isActive }) => (
                    <button
                      type="button"
                      className={
                        isActive
                          ? "btn btn-outline-light w-100 h-100 disabled"
                          : "btn btn-outline-light w-100 h-100"
                      }
                    >
                      <FormattedMessage
                        id="app.allRepairShops"
                        defaultMessage="Repair shops"
                      />
                    </button>
                  )}
                </NavLink>
                <NavLink className="w-100 me-5 mt-lg-0 mt-3" to="/">
                  {({ isActive }) => (
                    <button
                      type="button"
                      className={
                        isActive
                          ? "btn btn-outline-light w-100 h-100 disabled"
                          : "btn btn-outline-light w-100 h-100"
                      }
                    >
                      <FormattedMessage
                        id="app.home"
                        defaultMessage="Home page"
                      />
                    </button>
                  )}
                </NavLink>
                {userRole >= Roles.User && (
                  <NavLink className="w-100 me-5 mt-lg-0 mt-3" to="/user">
                    {({ isActive }) => (
                      <button
                        type="button"
                        className={
                          isActive
                            ? "btn btn-outline-light w-100 h-100 disabled"
                            : "btn btn-outline-light w-100 h-100"
                        }
                      >
                        <FormattedMessage
                          id="app.user"
                          defaultMessage="User pannel"
                        />
                      </button>
                    )}
                  </NavLink>
                )}
                {userRole === Roles.Manager && (
                  <NavLink
                    className="w-100 me-5 mt-lg-0 mt-3"
                    to="/repairShops"
                  >
                    {({ isActive }) => (
                      <button
                        type="button"
                        className={
                          isActive
                            ? "btn btn-outline-light w-100 h-100 disabled"
                            : "btn btn-outline-light w-100 h-100"
                        }
                      >
                        <FormattedMessage
                          id="app.repairShops"
                          defaultMessage="Your repair shops"
                        />
                      </button>
                    )}
                  </NavLink>
                )}
                <NavLink className="w-100 me-5 mt-lg-0 mt-3" to="/about">
                  {({ isActive }) => (
                    <button
                      type="button"
                      className={
                        isActive
                          ? "btn btn-outline-light w-100 h-100 disabled"
                          : "btn btn-outline-light w-100 h-100"
                      }
                    >
                      <FormattedMessage id="app.about" defaultMessage="About" />
                    </button>
                  )}
                </NavLink>
                <Dropdown className="text-center mt-lg-0 mt-3">
                  <Dropdown.Toggle
                    className="me-5"
                    variant="secondary"
                    id="dropdown-basic"
                  >
                    <FormattedMessage
                      id="app.selectLanguage"
                      defaultMessage="Select language"
                    />
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    onClick={languageContext.actions.changeLanguage}
                  >
                    {Languages.map((language, index) => {
                      return (
                        <Dropdown.Item id={language.id} key={index}>
                          {language.html}
                          {language.id === languageContext.locale ? " ✅" : ""}
                        </Dropdown.Item>
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown>
                {userEmail === "" && (
                  <>
                    <NavLink className="w-100 me-5 mt-lg-0 mt-3" to="/login">
                      {({ isActive }) => (
                        <button
                          type="button"
                          className={
                            isActive
                              ? "btn btn-primary w-100 disabled"
                              : "btn btn-primary w-100"
                          }
                        >
                          <FormattedMessage
                            id="app.login"
                            defaultMessage="Login"
                          />
                        </button>
                      )}
                    </NavLink>
                    <NavLink className="w-100 me-5 my-lg-0 my-3" to="/register">
                      {({ isActive }) => (
                        <button
                          type="button"
                          className={
                            isActive
                              ? "btn btn-secondary w-100 disabled"
                              : "btn btn-secondary w-100"
                          }
                        >
                          <FormattedMessage
                            id="app.register"
                            defaultMessage="Register"
                          />
                        </button>
                      )}
                    </NavLink>
                  </>
                )}
                {userEmail !== "" && (
                  <>
                    <Dropdown className="text-center my-lg-0 my-3">
                      <Dropdown.Toggle
                        className="me-5"
                        variant="secondary"
                        id="dropdown-basic"
                      >
                        {userEmail}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <DropdownItem onClick={logout}>
                          <FormattedMessage
                            id="app.logout"
                            defaultMessage="Logout"
                          />
                        </DropdownItem>
                      </Dropdown.Menu>
                    </Dropdown>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>
      <main className="container-fluid">
        <div className="row">
          <div className="col-12 text-white bg-dark">
            <Outlet />
          </div>
        </div>
      </main>
    </>
  );
};

export default NavigationBar;
