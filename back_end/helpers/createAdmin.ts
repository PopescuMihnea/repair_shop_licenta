import mongoose, { ConnectOptions } from "mongoose";
import promptSync from "prompt-sync";
import User from "../models/user";
import dotenv from "dotenv";
import Auth from "../controllers/auth";
import { IUser } from "../interfaces/user/IUser";
import { Roles } from "../enums/roles";

const prompt = promptSync();
dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

const dbConnectionString = process.env.DB_CONNECTION_STRING as string;

mongoose
  .connect(dbConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions)
  .then(async (res) => {
    const admin: IUser = {
      email: prompt("Enter admin email: "),
      firstName: prompt("Enter admin first name: "),
      lastName: prompt("Enter admin last name: "),
      password: Auth.hashString(prompt("Enter admin password: ")),
      role: Roles[Roles.Admin],
      verified: true,
    };

    const user = await User.create(admin);
    await user.save();
    console.log("Admin account succesfully created");
    return;
  })
  .catch((err) => {
    console.log("Error creating admin: ", err);
    throw err;
  });
