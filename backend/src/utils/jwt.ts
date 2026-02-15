import jwt from "jsonwebtoken"
import { env } from "../config/env"

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "15m"
  })
}

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d"
  })
}

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET)
}

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET)
}