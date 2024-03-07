import { NavLink } from "react-router-dom";
import { IRepairShop } from "../../interfaces/repairShop/IRepairShop";
/*import { findCookie } from "../../helpers/findCookie";
import { Roles } from "../../enums/roles";
import { userCookieName } from "../../consts";*/
import { FormattedMessage } from "react-intl";

const RepairShopCard: React.FC<{
  data: any;
  queryString: string;
  isManager?: boolean;
}> = ({ data, queryString, isManager }) => {
  const repairShop = data as IRepairShop;
  //const cookieRole: any = findCookie(userCookieName);
  //const userRole: number = parseInt(Roles[cookieRole]);

  console.log("eaea");
  console.log(repairShop);

  return (
    <div className="card bg-dark border-white" style={{ width: "16rem" }}>
      {repairShop && repairShop.image ? (
        <img
          src={URL.createObjectURL(
            new Blob([new Uint8Array(repairShop.image.data)], {
              type: `image/${repairShop.image.type.slice(1)}`,
            })
          )}
          alt="Repair shop image"
          className="card-img-top img-fluid"
          style={{ maxHeight: "100px" }}
        />
      ) : (
        <img
          alt="Unknown repair shop"
          src="/unknownRepairShop.jpg"
          style={{ maxHeight: "100px" }}
          className="card-img-top"
        />
      )}
      <div className="card-body">
        <h5 className="card-title">
          <FormattedMessage id="app.name" defaultMessage="Name" />:{" "}
          {repairShop.name}
        </h5>
        <div className="card-text">
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
            <FormattedMessage id="app.street" defaultMessage="Street" />:{" "}
            {repairShop.address.street}
          </p>
          <p>
            <FormattedMessage id="app.city" defaultMessage="City" />:{" "}
            {repairShop.address.city}
          </p>
          <p>
            <FormattedMessage id="app.county" defaultMessage="County" />:{" "}
            {repairShop.address.county}
          </p>
        </div>
        <NavLink
          to={
            isManager
              ? `/repairShops/${repairShop._id}`
              : `/repairShopsUser/${repairShop._id}`
          }
          state={{ queryString: queryString }}
        >
          <button className="btn btn-primary">
            <FormattedMessage
              id="app.viewRepairShop"
              defaultMessage="View repair shop"
            />
          </button>
        </NavLink>
      </div>
    </div>
  );
};

export default RepairShopCard;
