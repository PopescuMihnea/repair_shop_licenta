import * as yup from "yup";
import { ICarModify } from "../interfaces/car/ICarModify";
import { image } from "./partialSchemas/image";
import { colors } from "../consts";
import plateNumber from "./partialSchemas/plateNumber";

export const carSchema = yup.object<ICarModify>().shape({
  image: image,
  plateNumber: plateNumber,
  color: yup
    .string()
    .required("Color is required")
    .test({
      message: "Invalid color",
      test: (color) => {
        return colors.includes(color);
      },
    }),
  VIN: yup
    .string()
    .required("VIN is required")
    .test({
      message: "VIN must have 17 characters",
      test: (VIN) => {
        return VIN.length === 17;
      },
    }),
});
