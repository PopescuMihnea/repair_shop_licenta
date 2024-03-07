import { NavLink } from "react-router-dom";
import { useMemo } from "react";
import { IAppointment } from "../../interfaces/appointment/IAppointment";
import { Status } from "../../enums/status";
import { ICar } from "../../interfaces/car/ICar";
import { FormattedMessage } from "react-intl";

const AppointmentCard: React.FC<{
  data: any;
  queryString: string;
  resourceId?: string;
  isManager?: boolean;
}> = ({ data, queryString, resourceId, isManager }) => {
  const appointment = data as IAppointment;
  const date: Date = new Date(appointment.date);
  const statusColor = useMemo(() => {
    if (appointment) {
      switch (appointment!.status) {
        case Status[Status.Pending]:
          return "orange";
        case Status[Status.Denied]:
          return "red";
        case Status[Status.Accepted]:
          return "green";
        case Status[Status.Completed]:
          return "darkgreen";
        default:
          return "";
      }
    }

    return "";
  }, [appointment]);

  return (
    <div className="card bg-dark border-white" style={{ width: "16rem" }}>
      <div className="card-body">
        <h5 className="card-title">
          <FormattedMessage id="app.date" defaultMessage="Date" />:
          {date!.getDate() +
            "/" +
            (date!.getMonth() + 1) +
            "/" +
            date!.getFullYear()}
        </h5>
        <div className="card-text">
          <p>
            <FormattedMessage
              id="app.plateNumber"
              defaultMessage="Plate number"
            />
            :{(appointment.car! as ICar).plateNumber}
          </p>
          {isManager && (
            <p>
              <FormattedMessage
                id="app.userEmail"
                defaultMessage="User email"
              />
              : {(appointment.car! as ICar).user!.email}
            </p>
          )}
          <p style={{ color: statusColor }}>
            <FormattedMessage id="app.status" defaultMessage="Status" />
            :
            <FormattedMessage id={`app.status${appointment.status}`} />
          </p>
        </div>
        <NavLink
          to={
            isManager
              ? `/appointmentsManager/${appointment._id}`
              : `/appointmentsUser/${appointment._id}`
          }
          state={{
            queryString: queryString,
            resourceId: resourceId ? resourceId : "",
          }}
        >
          <button className="btn btn-primary">
            <FormattedMessage
              id="app.viewAppointment"
              defaultMessage="View appointment"
            />
          </button>
        </NavLink>
      </div>
    </div>
  );
};

export default AppointmentCard;
