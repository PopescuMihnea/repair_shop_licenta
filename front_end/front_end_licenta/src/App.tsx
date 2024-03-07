import "./App.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import NavigationBar from "./components/NavigationBar";
import Welcome from "./components/Welcome";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { Roles } from "./enums/roles";
import User from "./components/user/User";
import VerifyEmail from "./components/auth/VerifyEmail";
import RequestResetPassword from "./components/auth/RequestResetPassword";
import ResetPassword from "./components/auth/ResetPassword";
import ModifyUser from "./components/user/ModifyUser";
import Car from "./components/car/Car";
import CarForm from "./components/car/CarForm";
import RepairShopForm from "./components/repairShop/RepairShopForm";
import RepairShop from "./components/repairShop/RepairShop";
import AppointmentForm from "./components/appointment/AppointmentForm";
import Appointment from "./components/appointment/Appointment";
import Page404 from "./components/Page404";
import RepairShopManagerList from "./components/repairShop/RepairShopManagerList";
import RepairShopAllList from "./components/repairShop/RepairShopAllList";
import CarList from "./components/car/CarList";
import AppointmentUserList from "./components/appointment/AppointmentUserList";
import AppointmentManagerList from "./components/appointment/AppointmentManagerList";
import About from "./components/About";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<NavigationBar />}>
      <Route index element={<Welcome />} />
      <Route path="repairShopsAll" element={<RepairShopAllList />} />
      <Route path="register" element={<Register />} />
      <Route path="login" element={<Login />} />
      <Route path="auth/verify/:id" element={<VerifyEmail />} />
      <Route path="requestResetPassword" element={<RequestResetPassword />} />
      <Route path="auth/reset/:id" element={<ResetPassword />} />
      <Route path="about" element={<About />} />
      <Route
        element={
          <ProtectedRoutes roles={[Roles.User, Roles.Manager, Roles.Admin]} />
        }
      >
        <Route path="user" element={<User />} />
        <Route path="user/modify" element={<ModifyUser />} />
        <Route path="cars" element={<CarList />} />
        <Route path="cars/:id" element={<Car />} />
        <Route path="cars/create" element={<CarForm post={true} />} />
        <Route path="cars/put/:id" element={<CarForm post={false} />} />
        <Route
          path="repairShopsUser/:id"
          element={<RepairShop isManager={false} />}
        />
        <Route path="appointments/post/:id" element={<AppointmentForm />} />
        <Route
          path="appointmentsUser/:id"
          element={<Appointment isManager={false} />}
        />
        <Route
          path="appointments/:id/getAllUser"
          element={<AppointmentUserList />}
        />
      </Route>
      <Route element={<ProtectedRoutes roles={[Roles.Manager]} />}>
        <Route path="repairShops" element={<RepairShopManagerList />} />
        <Route
          path="repairShops/:id"
          element={<RepairShop isManager={true} />}
        />
        <Route
          path="repairShops/create"
          element={<RepairShopForm post={true} />}
        />
        <Route
          path="repairShops/put/:id"
          element={<RepairShopForm post={false} />}
        />
        <Route
          path="appointmentsManager/:id"
          element={<Appointment isManager={true} />}
        />
        <Route
          path="appointments/:id/getAllManager"
          element={<AppointmentManagerList />}
        />
      </Route>
      <Route path="*" element={<Page404 />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
