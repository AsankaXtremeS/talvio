import { Request, Response, NextFunction } from "express"
import { verifyAccessToken } from "../utils/jwt"

export const authenticate = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization

  if (!header) return res.status(401).json({ message: "Unauthorized" })

  const token = header.split(" ")[1]

  try {
    const decoded = verifyAccessToken(token)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: "Invalid token" })
  }
}
