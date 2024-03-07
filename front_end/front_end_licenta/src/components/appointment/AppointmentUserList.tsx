import { useLocation, useParams } from "react-router-dom";
import PagedList from "../PagedList";
import AppointmentCard from "./AppointmentCard";
import { NavLink } from "react-router-dom";
import { FormattedMessage } from "react-intl";

const AppointmentUserList: React.FC = () => {
  const { queryString } = useLocation().state ? useLocation().state : "";
  const { id } = useParams();

  return (
    <>
      <NavLink
        to={`/repairShopsUser/${id}`}
        state={{ queryString: queryString }}
      >
        <button type="button" className="btn btn-primary me-2 mt-3">
          {
            <FormattedMessage
              id="app.backToRepairShop"
              defaultMessage="Back to repair shop"
            />
          }
        </button>
      </NavLink>
      <PagedList
        grid={true}
        canCreate={true}
        searchOptions={[
          { key: "Plate Number", value: "plateNumber" },
          { key: "Status", value: "status" },
        ]}
        filterOptions={[
          { key: "Date", value: "date" },
          { key: "Status", value: "status" },
        ]}
        searchByLocation={false}
        resourceType="appointment"
        resourceUri="appointment/getUser"
        useIdForResource={true}
        createNewUri="/appointments/post"
        useIdForCreate={true}
        isManager={false}
        DataCard={AppointmentCard}
      />
    </>
  );
};

export default AppointmentUserList;
