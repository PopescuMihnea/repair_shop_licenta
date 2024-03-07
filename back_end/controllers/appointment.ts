import mongoose, { SortOrder, Types } from "mongoose";
import { Status } from "../enums/status";
import { extractErrorsFromMongoose } from "../helpers/extractErrorsFromMongoose";
import { IAppointment } from "../interfaces/appointment/IAppointment";
import { IAppointmentForm } from "../interfaces/appointment/IAppointmentForm";
import { IRequestAuthorized } from "../interfaces/request/IRequestAuthorized";
import { IResponseForm } from "../interfaces/response/IResponseForm";
import { IResponseJson } from "../interfaces/response/IResponseJson";
import { IResponseTypedBody } from "../interfaces/response/IResponseTypedBody";
import { isErrorMongoose } from "../interfaces/typeGuards/isErrorMongoose";
import { isErrorWithMessage } from "../interfaces/typeGuards/isErrorWithMessage";
import Appointment from "../models/appointment";
import Car from "../models/car";
import RepairShop from "../models/repairShop";
import User from "../models/user";
import { ICar } from "../interfaces/car/ICar";
import { IPagedList } from "../interfaces/IPagedList";
import { isRecordString } from "../interfaces/typeGuards/isRecordString";
import { isRecordSortOrder } from "../interfaces/typeGuards/isRecordSortOrder";
import { minPerPage, perPageDefault } from "../consts";

const get = async (
  req: IRequestAuthorized<never, Record<string, string>, { id: string }>,
  res: IResponseTypedBody<IPagedList<IAppointment>>
) => {
  let filter: Record<string, string> = {};
  let sort: Record<string, SortOrder> = {};
  let carFilter: Record<string, RegExp | Types.ObjectId> = {};
  carFilter["user"] = req.carsAuthUser!._id;
  let page: number = 1;
  let perPage = perPageDefault;

  let filterJson = "";
  try {
    filterJson = JSON.parse(req.query.filter);
  } catch (err) {}

  let sortJson = "";
  try {
    sortJson = JSON.parse(req.query.sort);
  } catch (err) {}

  page = parseInt(req.query.page);
  perPage = parseInt(req.query.perPage);

  if (isRecordString(filterJson)) {
    filter = filterJson;
  }

  if (isRecordSortOrder(sortJson)) {
    sort = sortJson;
  }

  /*console.log("filter", filter);
  console.log("sort", sort);
  console.log("page", page);
  console.log("per page", perPage);
  console.log("car filter", carFilter);*/

  try {
    let appointmentsQuerry = Appointment.where({
      repairShop: req.params.id,
    });
    let countQuerry = Appointment.where({
      repairShop: req.params.id,
    });

    for (let key in filter) {
      if (filter[key] !== "") {
        if (key === "plateNumber") {
          carFilter[key] = new RegExp(filter[key], "i");
        } else {
          appointmentsQuerry = appointmentsQuerry
            .where(key)
            .regex(new RegExp(filter[key], "i"));
          countQuerry = countQuerry
            .where(key)
            .regex(new RegExp(filter[key], "i"));
        }
      }
    }

    appointmentsQuerry.populate({
      path: "car",
      match: carFilter,
    });
    countQuerry.populate({
      path: "car",
      match: carFilter,
    });

    let sortString = "";
    for (let key in sort) {
      if (key !== "") {
        if (
          sort[key] === "asc" ||
          sort[key] === 1 ||
          sort[key] === "ascending"
        ) {
          sortString += sortString !== "" ? ` ${key}` : key;
        } else if (
          sort[key] === "desc" ||
          sort[key] === -1 ||
          sort[key] === "descending"
        ) {
          sortString += sortString !== "" ? ` -${key}` : `-${key}`;
        }
      }
    }

    const numAppointments = (await countQuerry).reduce((num, appointment) => {
      if (appointment.car) {
        return num + 1;
      }
      return num;
    }, 0);

    if (!page) {
      page = 1;
    }
    if (!perPage) {
      perPage = perPageDefault;
    }

    const maxPages = Math.ceil(numAppointments / perPage);

    const skipNr =
      page <= Math.max(maxPages, 1) ? Math.max(page - 1, 0) * perPage : 0;
    const limitNr = Math.max(perPage, minPerPage);
    const appointments = await appointmentsQuerry.sort(sortString);
    /*const appointments = await appointmentsQuerry
      .sort(sortString)
      .skip(skipNr)
      .limit(limitNr);*/

    const resAppointments: IPagedList<IAppointment> = {
      data: [],
      page: page && page > 0 && page <= Math.max(maxPages, 1) ? page : 1,
      pages: Math.max(
        Math.ceil(
          numAppointments /
            (perPage && perPage > minPerPage ? perPage : minPerPage)
        ),
        1
      ),
    };

    appointments.forEach((appointment) => {
      if (appointment.car) {
        const appointmentCar = appointment.car as ICar;

        const resAppointment: IAppointment = {
          _id: appointment._id,
          date: appointment.date,
          status: appointment.status,
          car: appointmentCar,
        };

        resAppointments.data.push(resAppointment);
      }
    });

    //console.log(resAppointments);
    resAppointments.data = resAppointments.data.slice(skipNr, skipNr + limitNr);
    res.status(200).json(resAppointments);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const getManager = async (
  req: IRequestAuthorized<never, Record<string, string>, { id: string }>,
  res: IResponseTypedBody<IPagedList<IAppointment>>
) => {
  let filter: Record<string, string> = {};
  let sort: Record<string, SortOrder> = {};
  let carFilter: Record<string, RegExp> = {};
  let userFilter: Record<string, RegExp> = {};
  let page: number = 1;
  let perPage = perPageDefault;

  let filterJson = "";
  try {
    filterJson = JSON.parse(req.query.filter);
  } catch (err) {}

  let sortJson = "";
  try {
    sortJson = JSON.parse(req.query.sort);
  } catch (err) {}

  page = parseInt(req.query.page);
  perPage = parseInt(req.query.perPage);

  if (isRecordString(filterJson)) {
    filter = filterJson;
  }

  if (isRecordSortOrder(sortJson)) {
    sort = sortJson;
  }

  /*console.log("filter", filter);
  console.log("sort", sort);
  console.log("page", page);
  console.log("per page", perPage);
  console.log("car filter", carFilter);
  console.log("user filter", userFilter);*/

  try {
    let appointmentsQuerry = Appointment.where({
      repairShop: req.params.id,
    });
    let countQuerry = Appointment.where({
      repairShop: req.params.id,
    });

    for (let key in filter) {
      if (filter[key] !== "") {
        if (key === "plateNumber") {
          carFilter[key] = new RegExp(filter[key], "i");
        } else if (key === "email") {
          userFilter[key] = new RegExp(filter[key], "i");
        } else {
          appointmentsQuerry = appointmentsQuerry
            .where(key)
            .regex(new RegExp(filter[key], "i"));
          countQuerry = countQuerry
            .where(key)
            .regex(new RegExp(filter[key], "i"));
        }
      }
    }

    appointmentsQuerry
      .populate({
        path: "car",
        match: carFilter,
        populate: {
          path: "user",
          match: userFilter,
        },
      })
      .populate({
        path: "repairShop",
        match: { user: req.carsAuthUser!._id },
      });
    countQuerry
      .populate({
        path: "car",
        match: carFilter,
        populate: {
          path: "user",
          match: userFilter,
        },
      })
      .populate({
        path: "repairShop",
        match: { user: req.carsAuthUser!._id },
      });

    let sortString = "";
    for (let key in sort) {
      if (key !== "") {
        if (
          sort[key] === "asc" ||
          sort[key] === 1 ||
          sort[key] === "ascending"
        ) {
          sortString += sortString !== "" ? ` ${key}` : key;
        } else if (
          sort[key] === "desc" ||
          sort[key] === -1 ||
          sort[key] === "descending"
        ) {
          sortString += sortString !== "" ? ` -${key}` : `-${key}`;
        }
      }
    }

    const numAppointments = (await countQuerry).reduce((num, appointment) => {
      if (
        appointment.car &&
        (appointment.car as ICar).user &&
        appointment.repairShop
      ) {
        return num + 1;
      }
      return num;
    }, 0);

    if (!page) {
      page = 1;
    }
    if (!perPage) {
      perPage = perPageDefault;
    }

    const maxPages = Math.ceil(numAppointments / perPage);

    const skipNr =
      page <= Math.max(maxPages, 1) ? Math.max(page - 1, 0) * perPage : 0;
    const limitNr = Math.max(perPage, minPerPage);
    const appointments = await appointmentsQuerry.sort(sortString);
    /*const appointments = await appointmentsQuerry
      .sort(sortString)
      .skip(skipNr)
      .limit(limitNr);*/

    const resAppointments: IPagedList<IAppointment> = {
      data: [],
      page: page && page > 0 && page <= Math.max(maxPages, 1) ? page : 1,
      pages: Math.max(
        Math.ceil(
          numAppointments /
            (perPage && perPage > minPerPage ? perPage : minPerPage)
        ),
        1
      ),
    };

    appointments.forEach((appointment) => {
      if (
        appointment.car &&
        (appointment.car as ICar).user &&
        appointment.repairShop
      ) {
        const appointmentCar = appointment.car as ICar;

        const resAppointment: IAppointment = {
          _id: appointment._id,
          date: appointment.date,
          status: appointment.status,
          car: appointmentCar,
        };

        resAppointments.data.push(resAppointment);
      }
    });

    //console.log(resAppointments);
    resAppointments.data = resAppointments.data.slice(skipNr, skipNr + limitNr);
    res.status(200).json(resAppointments);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const getOne = async (
  req: IRequestAuthorized<never, never, { id: string }>,
  res: IResponseTypedBody<IAppointment>
) => {
  try {
    const user = await User.findById(req.carsAuthUser!._id);

    if (user) {
      const appointment = await Appointment.findById(req.params.id)
        .populate("car")
        .populate({
          path: "repairShop",
          populate: {
            path: "user",
          },
        });

      //console.log(user);
      const carIds = (await Car.find({ user: user._id }).distinct("_id")).map(
        (id) => id.toString()
      );
      if (
        appointment &&
        appointment.car &&
        carIds.includes(appointment.car._id!.toString())
      ) {
        const appointmentRes: IAppointment = {
          date: appointment.date,
          status: appointment.status,
          car: appointment.car,
          repairShop: appointment.repairShop,
        };
        res.status(200).json(appointmentRes);
      } else {
        res.sendStatus(404);
      }
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    console.log("Error getting appointment with id: ", req.params.id);
    console.log("Error: ", err);
    if (isErrorMongoose(err) && err.message.includes("Cast to ObjectId")) {
      res.sendStatus(404);
    } else {
      res.sendStatus(500);
    }
  }
};

const getOneManager = async (
  req: IRequestAuthorized<never, never, { id: string }>,
  res: IResponseTypedBody<IAppointment>
) => {
  try {
    const user = await User.findById(req.carsAuthUser!._id);

    if (user) {
      const appointment = await Appointment.findById(req.params.id)
        .populate("repairShop")
        .populate({
          path: "car",
          populate: {
            path: "user",
          },
        });

      const repairShopIds = (
        await RepairShop.find({ user: user._id }).distinct("_id")
      ).map((id) => id.toString());

      if (
        appointment &&
        appointment.repairShop &&
        repairShopIds.includes(appointment.repairShop._id!.toString())
      ) {
        const appointmentRes: IAppointment = {
          date: appointment.date,
          status: appointment.status,
          car: appointment.car,
          repairShop: appointment.repairShop,
        };
        //console.log(appointmentRes);
        res.status(200).json(appointmentRes);
      } else {
        res.sendStatus(404);
      }
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    console.log("Error getting appointment with id: ", req.params.id);
    console.log("Error: ", err);
    if (isErrorMongoose(err) && err.message.includes("Cast to ObjectId")) {
      res.sendStatus(404);
    } else {
      res.sendStatus(500);
    }
  }
};

const changeStatus = async (
  req: IRequestAuthorized<never, never, { id: string }>,
  res: IResponseTypedBody<IResponseJson>,
  status: Status
) => {
  let resBody: IResponseJson = {
    message: `Appointment was succesfully ${
      status === Status.Accepted ? "accepted" : "denied"
    }`,
  };

  try {
    const user = await User.findById(req.carsAuthUser!._id);
    if (user) {
      const repairShopIds = (
        await RepairShop.find({
          user: req.carsAuthUser!._id,
        }).distinct("_id")
      ).map((id) => id.toString());

      //console.log(repairShopIds);

      const appointment = await Appointment.findById(req.params.id);
      if (
        appointment &&
        repairShopIds.includes(appointment.repairShop!.toString())
      ) {
        if (appointment.status === Status[Status.Pending]) {
          appointment.status = Status[status];
          await appointment.save();
          res.status(200).json(resBody);
        } else {
          resBody.message = `Cannot ${
            status === Status.Accepted ? "accept" : "deny"
          } appointment since it is not pending`;
          res.status(400).json(resBody);
        }
      } else {
        resBody.message = `No appointment found`;
        res.status(404).json(resBody);
      }
    } else {
      resBody.message = "User not found";
      res.status(400).json(resBody);
    }
  } catch (err) {
    console.log(`Error when ${status} appointment`, err);
    if (isErrorWithMessage(err)) {
      resBody.message = `Error when ${
        status === Status.Accepted ? "accepting" : "denying"
      } appointment: ${err.message}`;
      res.status(500).json(resBody);
    }
  }
};

const accept = async (
  req: IRequestAuthorized<never, never, { id: string }>,
  res: IResponseTypedBody<IResponseJson>
) => {
  changeStatus(req, res, Status.Accepted);
};

const deny = async (
  req: IRequestAuthorized<never, never, { id: string }>,
  res: IResponseTypedBody<IResponseJson>
) => {
  changeStatus(req, res, Status.Denied);
};

const postOne = async (
  req: IRequestAuthorized<IAppointmentForm, never, { id: string }>,
  res: IResponseTypedBody<IResponseJson>
) => {
  let resBody: IResponseForm<IAppointmentForm> = {
    message: "New appointment created succesfully",
    values: req.body,
  };

  try {
    const user = await User.findById(req.carsAuthUser!._id);

    if (new Date(req.body.date) > new Date()) {
      if (user) {
        const car = await Car.findOne({
          plateNumber: req.body.plateNumber,
          user: user.id,
        });

        if (car) {
          const repairShop = await RepairShop.findById(req.params.id);

          if (repairShop) {
            const existingAppointment = await Appointment.findOne({
              date: req.body.date,
              repairShop: repairShop._id,
            });

            //console.log(existingAppointment);
            if (!existingAppointment) {
              const appointment: IAppointment = {
                date: req.body.date,
                car: car._id,
                repairShop: repairShop._id,
                status: Status[Status.Pending],
              };
              await Appointment.create(appointment);
              res.status(201).json(resBody);
            } else {
              resBody.message = "Validation failed";
              resBody.errors = [];
              resBody.errors.push({
                key: "date",
                message:
                  "There already is an appointment for this date and car",
              });
              resBody.errors.push({
                key: "plateNumber",
                message:
                  "There already is an appointment for this car at this date",
              });

              res.status(422).json(resBody);
            }
          } else {
            resBody.message = "Repair shop not found";
            res.status(404).json(resBody);
          }
        } else {
          resBody.message = "Validation failed";
          resBody.errors = [];
          resBody.errors.push({
            key: "plateNumber",
            message: "You don't own any car with this plate number",
          });
          res.status(422).json(resBody);
        }
      } else {
        resBody.message = "User not found";
        res.status(400).json(resBody);
      }
    } else {
      resBody.message = "Validation failed";
      resBody.errors = [];
      resBody.errors.push({
        key: "date",
        message: "Date must be at least tommorow",
      });

      res.status(422).json(resBody);
    }
  } catch (err) {
    resBody.message = "";

    if (isErrorMongoose(err)) {
      resBody.message = "Validation failed";
      console.log(err);
      resBody.errors = extractErrorsFromMongoose(err.message);
      res.status(422).json(resBody);
    } else if (isErrorWithMessage(err)) {
      resBody.message = `Error when creating appointment: ${err.message}`;
      res.status(500).json(resBody);
    }
  }
};

const deleteOne = async (
  req: IRequestAuthorized<never, never, { id: string }>,
  res: IResponseTypedBody<IResponseJson>
) => {
  let resBody: IResponseJson = {
    message: "Appointment was succesfully deleted",
  };

  try {
    const user = await User.findById(req.carsAuthUser!._id);

    if (user) {
      /*console.log(req.carsAuthUser!._id);
      console.log(new Types.ObjectId(req.params.id));*/
      const appointment = await Appointment.findOne({
        _id: req.params.id,
      }).populate("car");

      if (
        appointment &&
        req.carsAuthUser!._id.toString() ===
          (appointment!.car as ICar).user.toString()
      ) {
        if (appointment.status === Status[Status.Pending]) {
          await Appointment.deleteOne({ _id: appointment._id });
          res.status(200).json(resBody);
        } else {
          resBody.message = "Cannot delete appointment since it is not pending";
          res.status(400).json(resBody);
        }
      } else {
        resBody.message = "Appointment not found";
        res.status(404).json(resBody);
      }
    } else {
      resBody.message = "User not found";
      res.status(400).json(resBody);
    }
  } catch (err) {
    resBody.message = "";

    if (isErrorMongoose(err)) {
      resBody.message = "Validation failed";
      console.log(err);
      resBody.errors = extractErrorsFromMongoose(err.message);
      res.status(422).json(resBody);
    } else if (isErrorWithMessage(err)) {
      resBody.message = `Error when deleting appointment: ${err.message}`;
      res.status(500).json(resBody);
    }
  }
};

export default {
  get,
  getManager,
  getOne,
  getOneManager,
  postOne,
  deleteOne,
  accept,
  deny,
};
