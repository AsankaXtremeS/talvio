// Middleware to authenticate requests using Bearer JWT access tokens.
import { Request, Response, NextFunction } from "express"
import { verifyAccessToken } from "../utils/jwt"

export const authenticate = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;

  const bearerToken = header && header.startsWith("Bearer ") ? header.split(" ")[1] : undefined;
  const cookieToken = req.cookies?.accessToken as string | undefined;

  const tokenCandidates = [bearerToken, cookieToken].filter(Boolean) as string[];
  if (tokenCandidates.length === 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  for (const token of tokenCandidates) {
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      return next();
    } catch (err) {
      // Log token verification errors for debugging
      console.error(`Token verification failed:`, (err as Error).message);
      // Try next token candidate.
    }
  }

  console.error(`All token verification attempts failed. Bearer: ${!!bearerToken}, Cookie: ${!!cookieToken}`);
  return res.status(401).json({ message: "Invalid token" });
};
