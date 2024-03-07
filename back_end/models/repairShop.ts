import mongoose, { Types } from "mongoose";
import { IRepairShop } from "../interfaces/repairShop/IRepairShop";
import { deleteFolderRecursive } from "../helpers/deleteFolderRecursive";
import Address from "./address";
import Appointment from "./appointment";
const schema = mongoose.Schema;

const repairShopSchema = new schema({
  image: {
    type: String,
  },
  name: {
    required: true,
    type: String,
    unique: true,
    match: [
      /^(?=.*[a-zA-Z])[a-zA-Z0-9 -]+$/,
      "Name can only contain alphanumeric characters,spaces or hyphens and must contain letters",
    ],
  },
  user: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId,
    ref: "user",
  },
  address: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId,
    ref: "address",
  },
});

repairShopSchema.pre<{ _conditions: { _id: Types.ObjectId } }>(
  new RegExp("deleteOne"),
  async function () {
    const repairShop = await RepairShop.findById(this._conditions._id);

    deleteFolderRecursive(`./blob/repairShops/${repairShop!.name}`);

    await Address.deleteOne({ _id: repairShop!.address });

    const appointments = await Appointment.find({
      repairShop: this._conditions._id,
    });
    appointments.forEach(async (appointment) => {
      await Appointment.deleteOne({ _id: appointment._id });
    });
  }
);

const RepairShop = mongoose.model<IRepairShop>("repairShop", repairShopSchema);

export default RepairShop;
