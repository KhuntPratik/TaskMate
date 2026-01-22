'use server';

import { prisma } from "../../lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";

export async function loginAction(email: string, password: string) {
  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user || user.passwordhash !== password) {
    return null;
  }


  const token = jwt.sign(
    {
      id: user.userid,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    id: user.userid,
    email: user.email,
    token,
  };
}
