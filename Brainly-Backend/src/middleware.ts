import { Request, NextFunction, Response } from "express";

declare global {
  namespace Express {
    export interface Request {
      userId?: string;
    }
  }
}
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //   try {
  const header = req.headers["authorization"];
  const decoded = jwt.verify(header as string, JWT_PASSWORD);
  if (decoded) {
    if (typeof decoded === "string") {
      res.status(403).json({
        message: "You are not logged in ",
      });
      return;
    }

    req.userId = (decoded as JwtPayload).id;
    next();
  } else {
    res.status(403).json({
      message: "You are not logged in ",
    });
  }
  //overide the types of the express reuest object
  //   }
};
