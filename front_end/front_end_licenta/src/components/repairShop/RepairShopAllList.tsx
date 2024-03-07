import PagedList from "../PagedList";
import RepairShopCard from "./RepairShopCard";

const RepairShopAllList: React.FC = () => {
  return (
    <PagedList
      grid={true}
      canCreate={false}
      searchOptions={[
        { key: "Name", value: "name" },
        {
          key: "Owner email",
          value: "email",
        },
      ]}
      filterOptions={[{ key: "Name", value: "name" }]}
      searchByLocation={true}
      resourceType="repair shop"
      resourceUri="repairShop/getAll"
      isManager={false}
      DataCard={RepairShopCard}
    />
  );
};

export default RepairShopAllList;
