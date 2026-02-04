import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";

export function verifyToken(req: NextRequest | Request) {
    try {
        const token =
            (req as any).cookies?.get?.("token")?.value ||
            req.headers.get("cookie")?.split("; ").find((row) => row.startsWith("token="))?.split("=")[1] ||
            req.headers.get("authorization")?.split(" ")[1];

        if (!token) return null;

        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}
