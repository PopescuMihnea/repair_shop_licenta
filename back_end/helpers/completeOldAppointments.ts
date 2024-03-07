import { Status } from "../enums/status";
import Appointment from "../models/appointment";

export const completeOldAppointments = () => {
  const currentDate = new Date();

  Appointment.find({
    date: { $lt: currentDate },
    status: Status[Status.Accepted],
  }).then((appointments) => {
    appointments.forEach((appointment) => {
      appointment.updateOne({ status: Status[Status.Completed] });
    });

    console.log(`${appointments.length} appointment(s) set to complete.`);
  });
};
