import PagedList from "../PagedList";
import RepairShopCard from "./RepairShopCard";

const RepairShopManagerList: React.FC = () => {
  return (
    <PagedList
      grid={true}
      canCreate={true}
      searchOptions={[{ key: "Name", value: "name" }]}
      filterOptions={[{ key: "Name", value: "name" }]}
      searchByLocation={true}
      resourceType="repair shop"
      resourceUri="repairShop/get"
      createNewUri="/repairShops/create"
      isManager={true}
      DataCard={RepairShopCard}
    />
  );
};

export default RepairShopManagerList;
