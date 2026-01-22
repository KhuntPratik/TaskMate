// import { prisma } from "../../../lib/prisma";
// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";

// export async function POST(req: Request) {
//   const { email, password } = await req.json();

//   const user = await prisma.users.findUnique({
//     where: { email },
//   });

//   if (!user || user.passwordhash !== password) {
//     return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//   }

//   const token = jwt.sign(
//     { id: user.userid, email: user.email },
//     JWT_SECRET,
//     { expiresIn: "1d" }
//   );

//   const response = NextResponse.json({
//     id: user.userid,
//     email: user.email,
//   });

//   response.cookies.set("token", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     maxAge: 60 * 60 * 24, // 1 day
//     path: "/",
//   });

//   return response;
// }
