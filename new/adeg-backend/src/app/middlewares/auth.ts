import { NextFunction, Request, Response } from "express";

import config from "../../config";

import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

import httpStatus from "http-status";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import ApiError from "../../errors/ApiErrors";
import prisma from "../../shared/prisma";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Verify token needed");
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        if (req.headers.accept === "text/event-stream") {
          res.writeHead(httpStatus.UNAUTHORIZED, {
            "Content-Type": "text/event-stream",
            Connection: "close",
          });
          res.write(
            `event: error\ndata: ${JSON.stringify({
              message: "User not found!",
            })}\n\n`
          );
          res.end();
          return;
        }
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }
    
      // const verifiedUser = jwtHelpers.verifyToken(
      //   token,
      //   config.jwt.jwt_secret as Secret
      // );
      
       const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_secret as Secret
      );


  
      const existingUser = await prisma.user.findUnique({
        where: { id: verifiedUser.id },
      });

      if (!existingUser) {
        if (req.headers.accept === "text/event-stream") {
          res.writeHead(httpStatus.UNAUTHORIZED, {
            "Content-Type": "text/event-stream",
            Connection: "close",
          });
          res.write(
            `event: error\ndata: ${JSON.stringify({
              message: "User not found!",
            })}\n\n`
          );
          res.end();
          return;
        }

        throw new ApiError(httpStatus.UNAUTHORIZED, "User not found!");
      }

      req.user = existingUser;

      if(existingUser.status !== "ACTIVE") {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Your account has been deactivated! Please contact with support.");
      }

      if(existingUser.isDeleted) {
        throw new ApiError(httpStatus.TEMPORARY_REDIRECT, "Your account has been deleted! Please contact with support.");
      }
      

      if (roles.length && !roles.includes(existingUser.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Forbidden! You are not authorized"
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};


// New optional auth function
export const optionalAuth = () => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authHeader = req.headers.authorization;

      // If no authorization header or not Bearer token, just proceed without user
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        req.user = null; // or undefined
        return next();
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        req.user = null;
        return next();
      }

      try {
        // Verify the token
        const verifiedUser = jwtHelpers.verifyToken(
          token,
          config.jwt.jwt_secret as Secret
        );

        // Find the user in database
        const existingUser = await prisma.user.findUnique({
          where: { id: verifiedUser.id },
        });

        // If user exists, attach to request; otherwise set to null
        req.user = existingUser || null;
      } catch (jwtError) {
        // If token verification fails, just proceed without user
        req.user = null;
      }

      next();
    } catch (err) {
      // Any unexpected error, just proceed without user
      req.user = null;
      next();
    }
  };
};


export default auth;
