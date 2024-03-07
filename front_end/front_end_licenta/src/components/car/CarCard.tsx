import { NavLink } from "react-router-dom";
import { ICar } from "../../interfaces/car/ICar";
import { FormattedMessage } from "react-intl";

const CarCard: React.FC<{ data: any; queryString: string }> = ({
  data,
  queryString,
}) => {
  const car = data as ICar;

  return (
    <div className="card bg-dark border-white" style={{ width: "16rem" }}>
      {car && car.image ? (
        <img
          src={URL.createObjectURL(
            new Blob([new Uint8Array(car.image.data)], {
              type: `image/${car.image.type.slice(1)}`,
            })
          )}
          alt="Car image"
          className="card-img-top img-fluid"
          style={{ maxHeight: "100px" }}
        />
      ) : (
        <img
          alt="Unknown car"
          src="/unknownCar.jpg"
          style={{ maxHeight: "100px" }}
          className="card-img-top"
        />
      )}
      <div className="card-body">
        <h5 className="card-title">{car!.plateNumber}</h5>
        <div className="card-text">
          <p className="mt-3">VIN: {car!.VIN}</p>
          <p>
            <FormattedMessage id="app.color" defaultMessage="Color" />:{" "}
            {car!.color}
          </p>
        </div>
        <NavLink to={`/cars/${car._id}`} state={{ queryString: queryString }}>
          <button className="btn btn-primary">
            <FormattedMessage id="app.viewCar" defaultMessage="View car" />
          </button>
        </NavLink>
      </div>
    </div>
  );
};

export default CarCard;
