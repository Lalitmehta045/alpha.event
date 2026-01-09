import jwt from "jsonwebtoken";

// Accept userId and email
export async function generateAccessToken(
  userId: string,
  email: string,
  role: string
) {
  const secret = process.env.SECRET_KEY_ACCESS_TOKEN;

  if (!secret) {
    throw new Error("SECRET_KEY_ACCESS_TOKEN is not defined in env");
  }

  const payload = {
    id: userId,
    email,
    role,
  };

  const token = jwt.sign(payload, secret, {
    expiresIn: "365d", // keep user logged in unless they sign out
  });

  return token;
}
