import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query("SELECT * FROM Users");
  return Response.json(result.rows);
}

export async function POST(req) {
  const body = await req.json();
  const { userName, email, passwordHash, roleId } = body;

  await pool.query(
    `INSERT INTO Users (UserName, Email, PasswordHash, RoleID)
     VALUES ($1, $2, $3, $4)`,
    [userName, email, passwordHash, roleId]
  );

  return Response.json({ message: "User created successfully" });
}
