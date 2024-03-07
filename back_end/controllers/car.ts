import { createFile } from "../helpers/createFile";
import { deleteFile } from "../helpers/deleteFile";
import { extractErrorsFromMongoose } from "../helpers/extractErrorsFromMongoose";
import { IBlobFile } from "../interfaces/IBlobFile";
import { ICar } from "../interfaces/car/ICar";
import { ICarBlob } from "../interfaces/car/ICarBlob";
import { IRequestAuthorized } from "../interfaces/request/IRequestAuthorized";
import { IResponseForm } from "../interfaces/response/IResponseForm";
import { IResponseJson } from "../interfaces/response/IResponseJson";
import { IResponseTypedBody } from "../interfaces/response/IResponseTypedBody";
import Car from "../models/car";
import User from "../models/user";
import { isErrorMongoose } from "../interfaces/typeGuards/isErrorMongoose";
import { isErrorWithMessage } from "../interfaces/typeGuards/isErrorWithMessage";
import fs from "fs";
import { deleteFolderRecursive } from "../helpers/deleteFolderRecursive";
import { SortOrder } from "mongoose";
import { isRecordString } from "../interfaces/typeGuards/isRecordString";
import { isRecordSortOrder } from "../interfaces/typeGuards/isRecordSortOrder";
import { perPageDefault, minPerPage } from "../consts";
import { IPagedList } from "../interfaces/IPagedList";

const get = async (
  req: IRequestAuthorized<never, Record<string, string>, never>,
  res: IResponseTypedBody<IPagedList<ICarBlob>>
) => {
  let filter: Record<string, string> = {};
  let sort: Record<string, SortOrder> = {};
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
  console.log("per page", perPage);*/

  try {
    let carQuerry = Car.find({ user: req.carsAuthUser!._id });
    let countQuerry = Car.find({ user: req.carsAuthUser!._id });

    for (let key in filter) {
      if (filter[key] !== "") {
        carQuerry = carQuerry.where(key).regex(new RegExp(filter[key], "i"));
        countQuerry = countQuerry
          .where(key)
          .regex(new RegExp(filter[key], "i"));
      }
    }

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

    /*console.log("sortString: ", sortString);*/

    const numCars = await countQuerry.count();

    if (!page) {
      page = 1;
    }
    if (!perPage) {
      perPage = perPageDefault;
    }

    const maxPages = Math.ceil(numCars / perPage);

    const skipNr =
      page <= Math.max(maxPages, 1) ? Math.max(page - 1, 0) * perPage : 0;
    const limitNr = Math.max(perPage, minPerPage);
    const cars = await carQuerry.sort(sortString).skip(skipNr).limit(limitNr);

    //console.log(numCars, cars);

    const resCars: IPagedList<ICarBlob> = {
      data: [],
      page: page && page > 0 && page <= Math.max(maxPages, 1) ? page : 1,
      pages: Math.max(
        Math.ceil(
          numCars / (perPage && perPage > minPerPage ? perPage : minPerPage)
        ),
        1
      ),
    };

    /*console.log(resCars.page);
    console.log(resCars.pages);*/

    cars.forEach((car) => {
      let image: IBlobFile | undefined = undefined;

      try {
        const file = Array.from(new Uint8Array(fs.readFileSync(car.image)));
        image = {
          data: file,
          type: `.${car.image.split(".")[2]}`,
        };
      } catch (err) {
        console.log(`Error reading image for car: ${car._id}`);
      }
      const resCar: ICarBlob = {
        _id: car._id,
        image,
        plateNumber: car.plateNumber,
        VIN: car.VIN,
        color: car.color,
      };

      resCars.data.push(resCar);
    });
    res.status(200).json(resCars);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const getOne = async (
  req: IRequestAuthorized<never, never, { id: string }>,
  res: IResponseTypedBody<ICarBlob>
) => {
  try {
    const car = await Car.findOne({
      user: req.carsAuthUser!._id,
      _id: req.params.id,
    });
    if (car) {
      let image: IBlobFile | undefined = undefined;

      try {
        const file = Array.from(new Uint8Array(fs.readFileSync(car.image)));
        image = {
          data: file,
          type: `.${car.image.split(".")[2]}`,
        };
      } catch (err) {
        console.log(`Error reading image for car: ${car._id}`);
      }
      const resCar: ICarBlob = {
        image,
        plateNumber: car.plateNumber,
        VIN: car.VIN,
        color: car.color,
      };

      res.status(200).json(resCar);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log("Error getting car with id: ", req.params.id);
    console.log("Error: ", err);
    if (isErrorMongoose(err) && err.message.includes("Cast to ObjectId")) {
      res.sendStatus(404);
    } else {
      res.sendStatus(500);
    }
  }
};

const postOne = async (
  req: IRequestAuthorized<ICarBlob, never, never>,
  res: IResponseTypedBody<IResponseJson>
) => {
  let resBody: IResponseForm<ICarBlob> = {
    message: "New car created succesfully",
    values: req.body,
  };

  let filePath = "";
  try {
    const user = await User.findById(req.carsAuthUser!._id);

    if (user) {
      if (req.body.image) {
        let binaryData = new Uint8Array(Buffer.from(req.body.image.data));
        filePath = `./blob/cars/${req.body.plateNumber.toUpperCase()}/image/carPhoto${
          req.body.image.type
        }`;
        deleteFile(filePath);
        createFile(filePath, binaryData);
      }

      const car: ICar = {
        image: filePath,
        plateNumber: req.body.plateNumber,
        VIN: req.body.VIN,
        color: req.body.color,
        user: req.carsAuthUser!._id,
      };

      await Car.create(car);
      res.status(201).json(resBody);
    } else {
      resBody.message = "Car not found";
      res.status(400).json(resBody);
    }
  } catch (err) {
    if (filePath !== "") {
      deleteFolderRecursive(
        `./blob/cars/${req.body.plateNumber.toUpperCase()}`
      );
    }

    resBody.message = "";

    if (isErrorMongoose(err)) {
      resBody.message = "Validation failed";
      console.log(err);
      resBody.errors = extractErrorsFromMongoose(err.message);
      res.status(422).json(resBody);
    } else if (isErrorWithMessage(err)) {
      resBody.message = `Error when creating car: ${err.message}`;
      res.status(500).json(resBody);
    }
  }
};

const putOne = async (
  req: IRequestAuthorized<ICarBlob, never, { id: string }>,
  res: IResponseTypedBody<IResponseJson>
) => {
  let resBody: IResponseForm<ICarBlob> = {
    message: "Car updated succesfully",
    values: req.body,
  };

  let filePath = "";
  try {
    const user = await User.findById(req.carsAuthUser!._id);

    if (user) {
      const car = await Car.findOne({
        user: req.carsAuthUser!._id,
        _id: req.params.id,
      });
      if (car) {
        if (req.body.image) {
          let binaryData = new Uint8Array(Buffer.from(req.body.image.data));
          filePath = `./blob/cars/${req.body.plateNumber}/image/carPhoto${req.body.image.type}`;
          if (filePath !== "") {
            deleteFile(filePath);
          }
          createFile(filePath, binaryData);
        }
        if (filePath !== "") {
          car.image = filePath;
        }

        if (car.plateNumber !== req.body.plateNumber) {
          deleteFolderRecursive(`./blob/cars/${car.plateNumber}`);
        }
        car.plateNumber = req.body.plateNumber;
        car.color = req.body.color;

        await car.save();
        res.status(200).json(resBody);
      } else {
        resBody.message = "Car not found";
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
      resBody.message = `Error when updating car: ${err.message}`;
      res.status(500).json(resBody);
    }
  }
};

const deleteOne = async (
  req: IRequestAuthorized<never, never, { id: string }>,
  res: IResponseTypedBody<IResponseJson>
) => {
  let resBody: IResponseJson = {
    message: "Car was succesfully deleted",
  };

  try {
    const user = await User.findById(req.carsAuthUser!._id);

    if (user) {
      const car = await Car.findOne({
        user: req.carsAuthUser!._id,
        _id: req.params.id,
      });
      if (car) {
        await Car.deleteOne({ _id: car._id });
        res.status(201).json(resBody);
      } else {
        resBody.message = "Car not found";
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
      resBody.message = `Error when deleting car: ${err.message}`;
      res.status(500).json(resBody);
    }
  }
};

export default { get, getOne, postOne, putOne, deleteOne };
