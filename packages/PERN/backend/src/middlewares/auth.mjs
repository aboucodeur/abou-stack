import dotenv from "dotenv"
dotenv.config()
// user model like ORM
import jwt from "jsonwebtoken"
// const { createError } = require("../utils")

export function auth(req, res, next) {
  try {
    if (!req.headers.authorization)
      return next(createError(400, "authorization requis"))
    const token = req.headers.authorization.split(" ")[1] // Bearer token
    const decodeToken = jwt.decode(token, process.env.TOKEN_SECRET)
    const userId = decodeToken && decodeToken.us_id
    if (decodeToken) {
      if (req.body.us_id && parseFloat(req.body.us_id) !== userId)
        throw new Error(`Invalid user ID unauthorized ${userId}`)
      //   const userInfo = await userModel.findByPk(userId)
      //   if (!userInfo) return next(createError(400, "user not found"))
      //   if (userInfo.disabled)
      //     return next(createError(400, "user account disabled"))
      //   req.user = userInfo
      next()
    }
  } catch (err) {
    return next(err)
  }
}
