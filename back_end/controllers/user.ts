import { IRequestAuthorized } from "../interfaces/request/IRequestAuthorized";
import { IResponseJson } from "../interfaces/response/IResponseJson";
import User from "../models/user";
import { IResponseTypedBody } from "../interfaces/response/IResponseTypedBody";
import { IUser } from "../interfaces/user/IUser";
import { IUserModify } from "../interfaces/user/IUserModify";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { isErrorMongoose } from "../interfaces/typeGuards/isErrorMongoose";
import { extractErrorsFromMongoose } from "../helpers/extractErrorsFromMongoose";
import { hashString } from "../helpers/hashString";
import { sendEmail } from "../helpers/sendEmail";
import VerifyLink from "../models/verifyLink";
import {
  urlExpiresHours,
  hourToMillis,
  jwtCookieName,
  userCookieName,
} from "../consts";

const getOne = async (
  req: IRequestAuthorized<never, never, never>,
  res: IResponseTypedBody<IUser>
) => {
  try {
    const user = await User.findById(req.carsAuthUser!._id);
    const userResponse: IUser = {
      email: user!.email,
      password: "",
      firstName: user!.firstName,
      lastName: user!.lastName,
      verified: user!.verified,
      role: user!.role,
    };
    res.status(200).json(userResponse);
  } catch (err) {
    console.log("Error getting user: ", req.carsAuthUser!.email);
    console.log("Error: ", err);
    res.sendStatus(500);
  }
};

const getOneAdmin = async (
  req: IRequestAuthorized<never, never, { id: string }>,
  res: IResponseTypedBody<IUser>
) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.sendStatus(400);
      return;
    }

    const userResponse: IUser = {
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      verified: user.verified,
      role: user.role,
    };

    res.status(200).json(userResponse);
  } catch (err) {
    console.log("Error getting user: ", req.carsAuthUser!.email);
    console.log("Error: ", err);
    res.sendStatus(500);
  }
};

const putOne = async (
  req: IRequestAuthorized<IUserModify, never, never>,
  res: IResponseTypedBody<IResponseJson>
) => {
  let resBody: IResponseJson = {
    message: "User was succesfully modified",
  };
  let changedEmail = false;
  try {
    const user = await User.findById(req.carsAuthUser!._id);
    if (user) {
      if (req.body.password !== "") {
        if (req.body.confirmPassword !== req.body.password) {
          resBody.message = "Passwords do not match";
          res.status(400).json(resBody);
          return;
        }
        if (!bcrypt.compareSync(req.body.oldPassword, user.password)) {
          resBody.message = "Wrong password";
          res.status(401).json(resBody);
          return;
        }

        user.password = hashString(req.body.password);
      }

      if (user.email !== req.body.email) {
        if (
          req.body.oldPassword === "" ||
          !bcrypt.compareSync(req.body.oldPassword, user.password)
        ) {
          resBody.message = "Wrong password";
          res.status(401).json(resBody);
          return;
        }

        user.email = req.body.email;
        changedEmail = true;
      }

      user.email = req.body.email;
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;

      if (changedEmail) {
        const url = crypto.randomBytes(128).toString("hex");
        const tomorrow = new Date(Date.now() + urlExpiresHours * hourToMillis);
        user.verified = false;

        await VerifyLink.deleteMany({ user: user._id });
        await VerifyLink.create({
          url,
          user: user._id,
          expires: tomorrow,
        });

        const websiteUrl = process.env.WEBSITE_URL;
        const emailHtml = `<h1>Please activate your account at ${websiteUrl}auth/verify/${url}</h1>
                     <p>The link will expire in ${urlExpiresHours} hours.</p>`;

        await sendEmail(req.body.email, emailHtml, "Cars account verification");
      }
      await user.save();

      res.status(200).json(resBody);
    } else {
      resBody.message = "User not found";
      res.status(404).json(resBody);
    }
  } catch (err) {
    console.log("Error modifying user: ", req.carsAuthUser!.email);
    console.log("Error: ", err);
    if (isErrorMongoose(err)) {
      resBody.message = "Validation failed";
      console.log(err);
      resBody.errors = extractErrorsFromMongoose(err.message);
      res.status(422).json(resBody);
    } else {
      resBody.message = "Error modifying user";
      res.status(500).json(resBody);
    }
  }
};

const deleteOne = async (
  req: IRequestAuthorized<never, never, never>,
  res: IResponseTypedBody<IResponseJson>
) => {
  let resBody: IResponseJson = {
    message: "User was succesfully deleted",
  };

  try {
    await User.deleteOne({ _id: req.carsAuthUser!._id });
    const enableHttps = process.env.HTTPS;
    res.cookie(jwtCookieName, "", {
      secure: enableHttps ? true : false,
      maxAge: 1,
      sameSite: enableHttps ? "strict" : undefined,
    });
    res.cookie(userCookieName, "", {
      secure: enableHttps ? true : false,
      maxAge: 1,
      sameSite: enableHttps ? "strict" : undefined,
    });
    res.status(200).json(resBody);
  } catch (err) {
    console.log("Error deleting user: ", req.carsAuthUser!.email);
    console.log("Error: ", err);
    resBody.message = "Error deleting user";
    res.status(500).json(resBody);
  }
};

const deleteOneAdmin = async (
  req: IRequestAuthorized<never, never, { id: string }>,
  res: IResponseTypedBody<IResponseJson>
) => {
  let resBody: IResponseJson = {
    message: "User was succesfully deleted",
  };

  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      resBody.message = "No user with this id";
      res.status(400).json(resBody);
      return;
    }

    await User.deleteOne({ _id: userId });
    res.status(200).json(resBody);
  } catch (err) {
    console.log("Error deleting user: ", req.carsAuthUser!.email);
    console.log("Error: ", err);
    resBody.message = "Error deleting user";
    res.status(500).json(resBody);
  }
};

export default { deleteOne, deleteOneAdmin, getOne, getOneAdmin, putOne };
