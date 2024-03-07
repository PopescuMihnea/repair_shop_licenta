import { SortOrder, Types } from "mongoose";
import { createFile } from "../helpers/createFile";
import { deleteFile } from "../helpers/deleteFile";
import { deleteFolderRecursive } from "../helpers/deleteFolderRecursive";
import { extractErrorsFromMongoose } from "../helpers/extractErrorsFromMongoose";
import { IBlobFile } from "../interfaces/IBlobFile";
import { IAddress } from "../interfaces/address/IAddress";
import { IRepairShop } from "../interfaces/repairShop/IRepairShop";
import { IRepairShopBlob } from "../interfaces/repairShop/IRepairShopBlob";
import { IRequestAuthorized } from "../interfaces/request/IRequestAuthorized";
import { IResponseForm } from "../interfaces/response/IResponseForm";
import { IResponseJson } from "../interfaces/response/IResponseJson";
import { IResponseTypedBody } from "../interfaces/response/IResponseTypedBody";
import { isErrorMongoose } from "../interfaces/typeGuards/isErrorMongoose";
import { isErrorWithMessage } from "../interfaces/typeGuards/isErrorWithMessage";
import { IUser } from "../interfaces/user/IUser";
import Address from "../models/address";
import RepairShop from "../models/repairShop";
import User from "../models/user";
import fs from "fs";
import { IPagedList } from "../interfaces/IPagedList";
import { minPerPage, perPageDefault } from "../consts";
import { isRecordString } from "../interfaces/typeGuards/isRecordString";
import { isRecordSortOrder } from "../interfaces/typeGuards/isRecordSortOrder";
import { Request } from "express";

const getNumber = async (
  req: Request,
  res: IResponseTypedBody<{ number: number }>
) => {
  try {
    const repairShopNumber = await RepairShop.count();
    res.status(200).json({ number: repairShopNumber });
  } catch (err) {
    res.sendStatus(500);
  }
};

const get = async (
  req: IRequestAuthorized<never, Record<string, string>, never>,
  res: IResponseTypedBody<IPagedList<IRepairShopBlob>>
) => {
  let filter: Record<string, string> = {};
  let sort: Record<string, SortOrder> = {};
  let addressFilter: Record<string, RegExp> = {};
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
    let repairShopQuerry = RepairShop.find({ user: req.carsAuthUser!._id });
    let countQuerry = RepairShop.find({ user: req.carsAuthUser!._id });

    for (let key in filter) {
      if (filter[key] !== "") {
        if (key === "street" || key === "city" || key === "county") {
          addressFilter[key] = new RegExp(filter[key], "i");
        } else {
          repairShopQuerry = repairShopQuerry
            .where(key)
            .regex(new RegExp(filter[key], "i"));
          countQuerry = countQuerry
            .where(key)
            .regex(new RegExp(filter[key], "i"));
        }
      }
    }
    repairShopQuerry.populate({
      path: "address",
      match: addressFilter,
    });
    countQuerry.populate({
      path: "address",
      match: addressFilter,
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

    /*console.log("sortString: ", sortString);*/

    const numRepairShops = (await countQuerry).reduce((num, repairShop) => {
      if (repairShop.address) {
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

    const maxPages = Math.ceil(numRepairShops / perPage);

    const skipNr =
      page <= Math.max(maxPages, 1) ? Math.max(page - 1, 0) * perPage : 0;
    const limitNr = Math.max(perPage, minPerPage);
    const repairShops = await repairShopQuerry.sort(sortString);
    /*const repairShops = await repairShopQuerry
      .sort(sortString)
      .skip(skipNr)
      .limit(limitNr);*/

    /*console.log(numRepairShops, repairShops);*/

    const resRepairShops: IPagedList<IRepairShopBlob> = {
      data: [],
      page: page && page > 0 && page <= Math.max(maxPages, 1) ? page : 1,
      pages: Math.max(
        Math.ceil(
          numRepairShops /
            (perPage && perPage > minPerPage ? perPage : minPerPage)
        ),
        1
      ),
    };

    /*console.log(resCars.page);
    console.log(resCars.pages);*/

    repairShops.forEach((repairShop) => {
      if (repairShop.address) {
        let image: IBlobFile | undefined = undefined;

        try {
          const file = Array.from(
            new Uint8Array(fs.readFileSync(repairShop.image))
          );
          image = {
            data: file,
            type: `.${repairShop.image.split(".")[2]}`,
          };
        } catch (err) {
          console.log(`Error reading image for car: ${repairShop._id}`);
        }

        const repairShopAddress = repairShop.address! as IAddress;
        const repairShopUser = repairShop.user! as IUser;
        const resRepairShop: IRepairShopBlob = {
          _id: repairShop._id,
          image,
          name: repairShop.name,
          address: repairShopAddress,
          userEmail: repairShopUser.email,
        };

        resRepairShops.data.push(resRepairShop);
      }
    });
    resRepairShops.data = resRepairShops.data.slice(skipNr, skipNr + limitNr);
    res.status(200).json(resRepairShops);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const getUnauthorized = async (
  req: IRequestAuthorized<never, Record<string, string>, never>,
  res: IResponseTypedBody<IPagedList<IRepairShopBlob>>
) => {
  let filter: Record<string, string> = {};
  let sort: Record<string, SortOrder> = {};
  let addressFilter: Record<string, RegExp> = {};
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
  console.log("per page", perPage);*/

  try {
    let repairShopQuerry = RepairShop.find();
    let countQuerry = RepairShop.find();

    for (let key in filter) {
      if (filter[key] !== "") {
        if (key === "street" || key === "city" || key === "county") {
          addressFilter[key] = new RegExp(filter[key], "i");
        } else if (key === "email") {
          userFilter[key] = new RegExp(filter[key], "i");
        } else {
          repairShopQuerry = repairShopQuerry
            .where(key)
            .regex(new RegExp(filter[key], "i"));
          countQuerry = countQuerry
            .where(key)
            .regex(new RegExp(filter[key], "i"));
        }
      }
    }
    repairShopQuerry
      .populate({
        path: "address",
        match: addressFilter,
      })
      .populate({ path: "user", match: userFilter });
    countQuerry
      .populate({
        path: "address",
        match: addressFilter,
      })
      .populate({ path: "user", match: userFilter });

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

    const numRepairShops = (await countQuerry).reduce((num, repairShop) => {
      if (repairShop.address && repairShop.user) {
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

    const maxPages = Math.ceil(numRepairShops / perPage);

    const skipNr =
      page <= Math.max(maxPages, 1) ? Math.max(page - 1, 0) * perPage : 0;
    const limitNr = Math.max(perPage, minPerPage);
    const repairShops = await repairShopQuerry.sort(sortString);
    /*const repairShops = await repairShopQuerry
      .sort(sortString)
      .skip(skipNr)
      .limit(limitNr);*/

    /*console.log(numRepairShops, repairShops);*/

    const resRepairShops: IPagedList<IRepairShopBlob> = {
      data: [],
      page: page && page > 0 && page <= Math.max(maxPages, 1) ? page : 1,
      pages: Math.max(
        Math.ceil(
          numRepairShops /
            (perPage && perPage > minPerPage ? perPage : minPerPage)
        ),
        1
      ),
    };

    /*console.log(resCars.page);
    console.log(resCars.pages);*/

    repairShops.forEach((repairShop) => {
      if (repairShop.address && repairShop.user) {
        let image: IBlobFile | undefined = undefined;

        try {
          const file = Array.from(
            new Uint8Array(fs.readFileSync(repairShop.image))
          );
          image = {
            data: file,
            type: `.${repairShop.image.split(".")[2]}`,
          };
        } catch (err) {
          console.log(`Error reading image for car: ${repairShop._id}`);
        }

        const repairShopAddress = repairShop.address! as IAddress;
        const repairShopUser = repairShop.user! as IUser;
        const resRepairShop: IRepairShopBlob = {
          _id: repairShop._id,
          image,
          name: repairShop.name,
          address: repairShopAddress,
          userEmail: repairShopUser.email,
        };

        resRepairShops.data.push(resRepairShop);
      }
    });
    resRepairShops.data = resRepairShops.data.slice(skipNr, skipNr + limitNr);
    res.status(200).json(resRepairShops);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const getOne = async (
  req: IRequestAuthorized<never, never, { id: string }>,
  res: IResponseTypedBody<IRepairShopBlob>
) => {
  try {
    const repairShop = await RepairShop.findOne({
      user: req.carsAuthUser!._id,
      _id: req.params.id,
    })
      .populate("user")
      .populate("address");
    if (repairShop) {
      let image: IBlobFile | undefined = undefined;

      try {
        const file = Array.from(
          new Uint8Array(fs.readFileSync(repairShop.image))
        );
        image = {
          data: file,
          type: `.${repairShop.image.split(".")[2]}`,
        };
      } catch (err) {
        console.log(`Error reading image for repair shop: ${repairShop._id}`);
      }

      const repairShopAddress = repairShop.address! as IAddress;
      const repairShopUser = repairShop.user! as IUser;

      const resRepairShop: IRepairShopBlob = {
        image,
        name: repairShop.name,
        address: repairShopAddress,
        userEmail: repairShopUser.email,
      };

      res.status(200).json(resRepairShop);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log("Error getting repair shop with id: ", req.params.id);
    console.log("Error: ", err);
    if (isErrorMongoose(err) && err.message.includes("Cast to ObjectId")) {
      res.sendStatus(404);
    } else {
      res.sendStatus(500);
    }
  }
};

const getOneUser = async (
  req: IRequestAuthorized<never, never, { id: string }>,
  res: IResponseTypedBody<IRepairShopBlob>
) => {
  try {
    const repairShop = await RepairShop.findOne({
      _id: req.params.id,
    })
      .populate("user")
      .populate("address");
    if (repairShop) {
      let image: IBlobFile | undefined = undefined;

      try {
        const file = Array.from(
          new Uint8Array(fs.readFileSync(repairShop.image))
        );
        image = {
          data: file,
          type: `.${repairShop.image.split(".")[2]}`,
        };
      } catch (err) {
        console.log(`Error reading image for repair shop: ${repairShop._id}`);
      }

      const repairShopAddress = repairShop.address! as IAddress;
      const repairShopUser = repairShop.user! as IUser;

      const resRepairShop: IRepairShopBlob = {
        image,
        name: repairShop.name,
        address: repairShopAddress,
        userEmail: repairShopUser.email,
      };

      res.status(200).json(resRepairShop);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log("Error getting repair shop with id: ", req.params.id);
    console.log("Error: ", err);
    if (isErrorMongoose(err) && err.message.includes("Cast to ObjectId")) {
      res.sendStatus(404);
    } else {
      res.sendStatus(500);
    }
  }
};

const postOne = async (
  req: IRequestAuthorized<IRepairShopBlob, never, never>,
  res: IResponseTypedBody<IResponseJson>
) => {
  let resBody: IResponseForm<IRepairShopBlob> = {
    message: "New repair shop created succesfully",
    values: req.body,
  };

  let filePath = "";
  let addressId: Types.ObjectId | undefined = undefined;
  try {
    const user = await User.findById(req.carsAuthUser!._id);

    if (user) {
      if (req.body.image) {
        let binaryData = new Uint8Array(Buffer.from(req.body.image.data));
        filePath = `./blob/repairShops/${req.body.name}/image/repairShopPhoto${req.body.image.type}`;
        deleteFile(filePath);
        createFile(filePath, binaryData);
      }

      const mongooseAddress = await Address.create(req.body.address);
      addressId = mongooseAddress._id;

      const repairShop: IRepairShop = {
        image: filePath,
        name: req.body.name,
        address: mongooseAddress._id,
        user: user.id,
      };

      await RepairShop.create(repairShop);
      res.status(201).json(resBody);
    } else {
      resBody.message = "User not found";
      res.status(400).json(resBody);
    }
  } catch (err) {
    if (filePath !== "") {
      deleteFolderRecursive(`./blob/repairShops/${req.body.name}`);
    }

    if (addressId) {
      await Address.deleteOne({ _id: addressId });
    }

    resBody.message = "";
    console.log(err);

    if (isErrorMongoose(err)) {
      resBody.message = "Validation failed";
      resBody.errors = extractErrorsFromMongoose(err.message);
      res.status(422).json(resBody);
    } else if (isErrorWithMessage(err)) {
      resBody.message = `Error when creating repair shop: ${err.message}`;
      console.log(err);
      res.status(500).json(resBody);
    }
  }
};

const putOne = async (
  req: IRequestAuthorized<IRepairShopBlob, never, { id: string }>,
  res: IResponseTypedBody<IResponseJson>
) => {
  let resBody: IResponseForm<IRepairShopBlob> = {
    message: "Repair shop updated succesfully",
    values: req.body,
  };

  let filePath = "";
  try {
    const user = await User.findById(req.carsAuthUser!._id);

    if (user) {
      const repairShop = await RepairShop.findOne({
        user: req.carsAuthUser!._id,
        _id: req.params.id,
      });

      if (repairShop) {
        if (req.body.image) {
          let binaryData = new Uint8Array(Buffer.from(req.body.image.data));
          filePath = `./blob/repairShops/${req.body.name}/image/repairShopPhoto${req.body.image.type}`;
          if (filePath !== "") {
            deleteFile(filePath);
          }
          createFile(filePath, binaryData);
        }
        if (filePath !== "") {
          repairShop.image = filePath;
        }

        if (repairShop.name !== req.body.name) {
          deleteFolderRecursive(`./blob/repairShops/${repairShop.name}`);
        }

        const oldMongooseAddress = await Address.findById(repairShop.address);

        if (oldMongooseAddress) {
          if (
            req.body.address.street !== oldMongooseAddress.street ||
            req.body.address.city !== oldMongooseAddress.city ||
            req.body.address.county !== oldMongooseAddress.county
          ) {
            await Address.deleteOne({ _id: oldMongooseAddress._id });

            const mongooseAddress = await Address.create(req.body.address);
            repairShop.address = mongooseAddress._id;
          }
        }

        await repairShop.save();
        res.status(200).json(resBody);
      } else {
        resBody.message = "Repair shop not found";
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
      resBody.message = `Error when updating repair shop: ${err.message}`;
      res.status(500).json(resBody);
    }
  }
};

const deleteOne = async (
  req: IRequestAuthorized<never, never, { id: string }>,
  res: IResponseTypedBody<IResponseJson>
) => {
  let resBody: IResponseJson = {
    message: "Repair shop was succesfully deleted",
  };

  try {
    const user = await User.findById(req.carsAuthUser!._id);

    if (user) {
      const repairShop = await RepairShop.findOne({
        user: req.carsAuthUser!._id,
        _id: req.params.id,
      });
      if (repairShop) {
        await RepairShop.deleteOne({ _id: repairShop._id });
        res.status(201).json(resBody);
      } else {
        resBody.message = "Repair shop not found";
        res.status(404).json(resBody);
      }
    } else {
      resBody.message = "Repair shop not found";
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
      resBody.message = `Error when deleting repair shop: ${err.message}`;
      res.status(500).json(resBody);
    }
  }
};

export default {
  getNumber,
  get,
  getUnauthorized,
  getOne,
  getOneUser,
  postOne,
  putOne,
  deleteOne,
};
