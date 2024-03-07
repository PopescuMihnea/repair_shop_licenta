import { useLocation, useParams } from "react-router-dom";
import PagedList from "../PagedList";
import AppointmentCard from "./AppointmentCard";
import { FormattedMessage } from "react-intl";
import { NavLink } from "react-router-dom";

const AppointmentManagerList: React.FC = () => {
  const { queryString } = useLocation().state ? useLocation().state : "";
  const { id } = useParams();

  return (
    <>
      <NavLink to={`/repairShops/${id}`} state={{ queryString: queryString }}>
        <button type="button" className="btn btn-primary me-2 mt-3">
          {
            <FormattedMessage
              id="app.backToYourRepairShop"
              defaultMessage="Back to your repair shop"
            />
          }
        </button>
      </NavLink>
      <PagedList
        grid={true}
        canCreate={false}
        searchOptions={[
          { key: "Plate Number", value: "plateNumber" },
          { key: "Status", value: "status" },
          { key: "User email", value: "email" },
        ]}
        filterOptions={[
          { key: "Date", value: "date" },
          { key: "Status", value: "status" },
        ]}
        searchByLocation={false}
        resourceType="appointment"
        resourceUri="appointment/getAllManager"
        useIdForResource={true}
        isManager={true}
        DataCard={AppointmentCard}
      />
    </>
  );
};

export default AppointmentManagerList;
