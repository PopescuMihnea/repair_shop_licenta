import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Roles } from "../enums/roles";
import { findCookie } from "../helpers/findCookie";

const ProtectedRoutes: React.FC<{ roles: Roles[] }> = ({ roles }) => {
  const userCookieName = "carsUser";
  const cookieRole: any = findCookie(userCookieName);
  const navigate = useNavigate();
  const userRole: number = parseInt(Roles[cookieRole]);
  const path = window.location.pathname;

  useEffect(() => {
    /*console.log("userRole in protected", cookieRole);
    console.log("pathname", path);*/

    if (!roles.includes(userRole)) {
      if (cookieRole !== undefined) {
        navigate("/user");
      } else {
        navigate("/login", { state: { returnUrl: path } });
      }
    }
  }, [userRole]);

  return <Outlet />;
};

export default ProtectedRoutes;
