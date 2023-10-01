// block app for specific user
// function deny(req, res, next) {
//   const clientIP = req.headers["X-Real-IP"] || req.ip
//   const isDenied = getIPS.includes(clientIP) // json file contains IP addresses
//   if (isDenied) return res.json("Revised account")
//   return next()
// }
