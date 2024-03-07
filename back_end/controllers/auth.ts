import bcrypt from "bcrypt";
import User from "../models/user";
import VerifyLink from "../models/verifyLink";
import ResetLink from "../models/resetLink";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { IRequestTypedBody } from "../interfaces/request/IRequestTypedBody";
import crypto from "crypto";
import { IUser } from "../interfaces/user/IUser";
import { IResponseJson } from "../interfaces/response/IResponseJson";
import { IResponseTypedBody } from "../interfaces/response/IResponseTypedBody";
import { extractErrorsFromMongoose } from "../helpers/extractErrorsFromMongoose";
import { hashString } from "../helpers/hashString";
import { sendEmail } from "../helpers/sendEmail";
import { isErrorMongoose } from "../interfaces/typeGuards/isErrorMongoose";
import { isErrorWithMessage } from "../interfaces/typeGuards/isErrorWithMessage";
import { IRequestTypedParams } from "../interfaces/request/IRequestTypedParams";
import { Roles } from "../enums/roles";
import { IUserLogin } from "../interfaces/user/IUserLogin";
import { IResponseForm } from "../interfaces/response/IResponseForm";
import { IRequestTyped } from "../interfaces/request/IRequestTyped";
import { IResetPassword } from "../interfaces/IResetPassword";
import { IRequestAuthorized } from "../interfaces/request/IRequestAuthorized";
import { Request, Response } from "express";
import {
  hourToSeconds,
  hourToMillis,
  jwtExpiresHours,
  urlExpiresHours,
  sendVerifyEmail,
  jwtCookieName,
  userCookieName,
} from "../consts";

const createJwt = (id: Types.ObjectId) => {
  const jwtSecret: string = process.env.JWT_SECRET as string;
  const issuer: string = process.env.JWT_ISSUER as string;

  return jwt.sign({ id }, jwtSecret, {
    expiresIn: jwtExpiresHours * hourToSeconds,
    issuer,
    audience: id.toString(),
  });
};

const getLoginTime = (
  req: Request,
  res: IResponseTypedBody<{ time: string }>
) => {
  return res.status(200).json({ time: jwtExpiresHours.toString() });
};

const register = async (
  req: IRequestTypedBody<IUser>,
  res: IResponseTypedBody<IResponseForm<IUser>>,
  err: any
) => {
  let resBody: IResponseForm<IUser> = {
    message: `New user created succesfully${
      sendVerifyEmail ? ", check your email for verification link" : ""
    }`,
    values: req.body,
  };

  if (req.body.role.toString() !== Roles[Roles.Admin]) {
    try {
      let userData = { ...req.body };
      userData.password = hashString(userData.password);
      const user = await User.create(userData);
      user.verified = sendVerifyEmail ? false : true;
      await user.save();

      if (sendVerifyEmail) {
        const url = crypto.randomBytes(128).toString("hex");
        const tomorrow = new Date(Date.now() + urlExpiresHours * hourToMillis);
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

      console.log("New user created", req.body.email);
      const token = createJwt(user._id);
      const enableHttps = process.env.HTTPS;
      res.cookie(jwtCookieName, token, {
        httpOnly: true,
        secure: enableHttps ? true : false,
        sameSite: enableHttps ? "strict" : undefined,
      });
      res.cookie(userCookieName, user.role, {
        secure: enableHttps ? true : false,
        sameSite: enableHttps ? "strict" : undefined,
      });

      resBody.values = undefined;
      res.status(201).json(resBody);
    } catch (err) {
      //let resBody: IResponseJson = { message: "Email already exists" };
      resBody.message = "";
      if (isErrorMongoose(err)) {
        resBody.message = "Validation failed";
        console.log(err);
        resBody.errors = extractErrorsFromMongoose(err.message);
        res.status(400).json(resBody);
      } else if (isErrorWithMessage(err)) {
        resBody.message = `Error when registering user: ${err.message}`;
        res.status(500).json(resBody);
      }
    }
  } else {
    resBody.message = "Error when registering user";
    res.status(400).json(resBody);
  }
};

const resetPasswordEmail = async (
  req: IRequestTypedBody<{ email: string }>,
  res: IResponseTypedBody<IResponseJson>
) => {
  const sendDetailedInfo = false;
  console.log("send reset password: ", req.body);
  let resBody: IResponseJson = {
    message:
      "If the email exists and is verified a password reset link was sent",
  };

  const user = await User.findOne({ email: req.body.email });

  if (user && user.verified === true) {
    try {
      const url = crypto.randomBytes(128).toString("hex");
      const tomorrow = new Date(Date.now() + urlExpiresHours * hourToMillis);
      await ResetLink.deleteMany({ user: user._id });
      await ResetLink.create({
        url,
        user: user._id,
        expires: tomorrow,
      });

      const websiteUrl = process.env.WEBSITE_URL;

      const emailHtml = `<h1>Please reset your password at ${websiteUrl}auth/reset/${url}</h1>
                     <p>The link will expire in ${urlExpiresHours} hours.</p>`;

      await sendEmail(req.body.email, emailHtml, "Cars password reset");
      console.log("Recovery email sent for", req.body.email);

      if (sendDetailedInfo) {
        res.status(200).json(resBody);
      }
    } catch (err) {
      console.log("Error sending reset password email: ", err);
      if (sendDetailedInfo) {
        resBody.message = "Error sending recovery email";
        res.status(500).json(resBody);
      }
    }
  } else {
    if (sendDetailedInfo) {
      resBody.message = "Email does not exist or is not verified";
      res.status(400).json(resBody);
    }
  }

  if (!sendDetailedInfo) {
    res.status(200).json(resBody);
  }
};

const verifyEmail = async (
  req: IRequestTypedParams<{ url: string }>,
  res: IResponseTypedBody<IResponseJson>
) => {
  let resBody: IResponseJson = {
    message: "User email verified",
  };

  const link = await VerifyLink.findOne({ url: req.params.url });

  if (!link) {
    resBody.message = "validation code not found";
    res.status(404).json(resBody);
  } else {
    if (link.expires >= new Date(Date.now())) {
      const user = await User.findById(link.user);

      if (user) {
        user.verified = true;
        await user.save();

        await VerifyLink.deleteOne({ _id: link._id });
        res.status(200).json(resBody);
      } else {
        resBody.message = "user of this code not found";
        res.status(404).json(resBody);
      }
    } else {
      resBody.message = "code expired";
      res.status(401).json(resBody);
    }
  }
};

const resendVerifyEmail = async (
  req: IRequestAuthorized<never, never, never>,
  res: IResponseTypedBody<IResponseJson>
) => {
  let resBody: IResponseJson = {
    message: "Email verification link sent again",
  };

  if (req.carsAuthUser!.verified) {
    resBody.message = "Email is already verified";
    res.status(400).json(resBody);
    return;
  }

  try {
    const url = crypto.randomBytes(128).toString("hex");
    const tomorrow = new Date(Date.now() + urlExpiresHours * hourToMillis);
    await VerifyLink.deleteMany({ user: req.carsAuthUser!._id });
    await VerifyLink.create({
      url,
      user: req.carsAuthUser!._id,
      expires: tomorrow,
    });

    const websiteUrl = process.env.WEBSITE_URL;
    const emailHtml = `<h1>Please activate your account at ${websiteUrl}auth/verify/${url}</h1>
                     <p>The link will expire in ${urlExpiresHours} hours.</p>`;

    await sendEmail(
      req.carsAuthUser!.email,
      emailHtml,
      "Cars account verification"
    );

    console.log("Resend verify email for", req.carsAuthUser!.email);
    res.status(200).json(resBody);
  } catch (err) {
    resBody.message = "Error when resending verification mail";
    res.status(500).json(resBody);
  }
};

const resetPassword = async (
  req: IRequestTyped<IResetPassword, never, { url: string }>,
  res: IResponseTypedBody<IResponseForm<IResetPassword>>
) => {
  let resBody: IResponseForm<IResetPassword> = {
    message: "Password is reset",
  };

  if (req.body.password !== req.body.confirmPassword) {
    resBody.message = "Passwords do not match";
    res.status(400).json(resBody);
    return;
  }
  const link = await ResetLink.findOne({ url: req.params.url });

  if (!link) {
    resBody.message = "reset code not found";
    res.status(404).json(resBody);
  } else {
    if (link.expires >= new Date(Date.now())) {
      const user = await User.findById(link.user);

      if (user) {
        try {
          user.password = req.body.password;
          user.password = hashString(user.password);
          await user.save();

          await ResetLink.deleteOne({ _id: link._id });
          console.log("Reset password of user", user.email);
          res.status(200).json(resBody);
        } catch (err) {
          if (isErrorMongoose(err)) {
            resBody.message = "Validation failed";
            resBody.errors = extractErrorsFromMongoose(err.message);
            resBody.values = req.body;
            res.status(400).json(resBody);
          }
        }
      } else {
        resBody.message = "user of this code not found";
        res.status(404).json(resBody);
      }
    } else {
      resBody.message = "code expired";
      res.status(401).json(resBody);
    }
  }
};

const login = async (
  req: IRequestTypedBody<IUserLogin>,
  res: IResponseTypedBody<IResponseJson>
) => {
  let resBody: IResponseForm<IUserLogin> = {
    message: "Logged in succesfully",
    values: req.body,
  };
  const email = req.body.email;
  const user = await User.findOne({ email });
  //console.log("stay logged in", req.body.stayLoggedIn);

  if (user !== null) {
    const passwordMatches = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (passwordMatches) {
      const token = createJwt(user._id);
      const maxAge: number = jwtExpiresHours * hourToMillis;
      const enableHttps = process.env.HTTPS;

      if (req.body.stayLoggedIn) {
        res.cookie(jwtCookieName, token, {
          httpOnly: true,
          secure: enableHttps ? true : false,
          maxAge,
          sameSite: enableHttps ? "strict" : undefined,
        });
        res.cookie(userCookieName, user.role, {
          secure: enableHttps ? true : false,
          maxAge,
          sameSite: enableHttps ? "strict" : undefined,
        });
      } else {
        res.cookie(jwtCookieName, token, {
          httpOnly: true,
          secure: enableHttps ? true : false,
          sameSite: enableHttps ? "strict" : undefined,
        });
        res.cookie(userCookieName, user.role, {
          secure: enableHttps ? true : false,
          sameSite: enableHttps ? "strict" : undefined,
        });
      }

      resBody.values = undefined;
      res.status(200).json(resBody);
    } else {
      resBody.message = "Invalid credentials";
      res.status(401).json(resBody);
    }
  } else {
    resBody.message = "Invalid credentials";
    res.status(401).json(resBody);
  }
};
const logout = (req: Request, res: Response) => {
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
  res.status(200).json({});
};

export default {
  getLoginTime,
  register,
  login,
  logout,
  verifyEmail,
  resetPasswordEmail,
  resetPassword,
  resendVerifyEmail,
  hashString,
  sendEmail,
};
