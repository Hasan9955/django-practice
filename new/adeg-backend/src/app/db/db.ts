import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "../../shared/prisma";
import config from "../../config";

export const initiateSuperAdmin = async () => {
  const payload = {
    id: "67de4b5db3d0bda15b780ba2",
    userName: "Brock Aguirre",
    // email: "superadmin@gmail10p.com",
    email: config.super_admin_email || "adegbuyifred@gmail.com",
    password: "12345678",
    role: UserRole.ADMIN,
    db: "1997-01-12T06:48:45.050Z",
    phoneNumber: "+8801515635005",
  };

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingSuperAdmin) {
    return;
  } else {
    const hashPassword = await bcrypt.hash(payload?.password as string, 10);
    await prisma.user.create({
      data: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        fullName: "Brock Aguirre",
        password: hashPassword,
        phoneNumber: payload.phoneNumber,
        admin: {
          create: {
            id: payload.id,
            email: payload.email,
            password: hashPassword,
            nickName: payload.userName,
          },
        },
      },
    });
  }
};

export const defaulPlatfrom = async () => {
  const payload = {
    id: "67de4b5db3d0bda15b780ca3",
  };

  const exitingPlatform = await prisma.platformMangement.findUnique({
    where: { id: payload.id },
  });

  if (exitingPlatform) {
    return;
  } else {
    await prisma.platformMangement.create({
      data: {
        id: payload.id,
      },
    });
  }
};
