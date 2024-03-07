import PagedList from "../PagedList";
import CarCard from "./CarCard";

const CarList: React.FC = () => {
  return (
    <PagedList
      grid={true}
      canCreate={true}
      searchOptions={[
        { key: "Plate Number", value: "plateNumber" },
        { key: "Color", value: "color" },
        { key: "VIN", value: "VIN" },
      ]}
      filterOptions={[
        { key: "Plate Number", value: "plateNumber" },
        { key: "Color", value: "color" },
        { key: "VIN", value: "VIN" },
      ]}
      searchByLocation={false}
      resourceType="car"
      resourceUri="car/get"
      createNewUri="/cars/create"
      isManager={false}
      DataCard={CarCard}
    />
  );
};

export default CarList;
