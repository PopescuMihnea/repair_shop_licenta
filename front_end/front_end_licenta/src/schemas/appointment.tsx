import * as yup from "yup";
import { IAppointmentModify } from "../interfaces/appointment/IAppointmentModify";
import plateNumber from "./partialSchemas/plateNumber";

export const appointmentSchema = yup.object<IAppointmentModify>().shape({
  plateNumber: plateNumber,
  date: yup
    .date()
    .required("Date is required")
    .test({
      message: "Date cannot be in the past or today",
      test: (date) => {
        console.log(date);
        return date > new Date();
      },
    }),
});
