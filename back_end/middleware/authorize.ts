import { Roles } from "../enums/roles";
import { Request, Response, NextFunction } from "express";
import { IResponseJson } from "../interfaces/response/IResponseJson";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { IRequestAuthorized } from "../interfaces/request/IRequestAuthorized";

export const authorize = (roles: Roles[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.cookies.carsJwt;

    const resBody: IResponseJson = { message: "You are not authenticated" };
    if (token) {
      const jwtSecret: string = process.env.JWT_SECRET as string;
      const issuer: string = process.env.JWT_ISSUER as string;

      jwt.verify(token, jwtSecret, { issuer }, async (err, tokenInfo) => {
        if (err) {
          res.status(401).json(resBody);
        } else {
          const id: string = (tokenInfo as { id: string }).id;
          const user = await User.findById(id);
          if (user) {
            const userRole: number = parseInt(Roles[<any>user.role]);

            if (roles.includes(userRole)) {
              (req as IRequestAuthorized<any, any, any>).carsAuthUser = user;
              next();
            } else {
              resBody.message = "You are not authorized";
              res.status(403).json(resBody);
            }
          } else {
            res.status(401).json(resBody);
          }
        }
      });
    } else {
      res.status(401).json(resBody);
    }
  };
};
