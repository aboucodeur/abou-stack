import dotenv from "dotenv"
dotenv.config()

// sender attach
function responseSender(req, res, next) {
  // Attach a helper function to the response object
  res.sendSuccess = (data, message = "Success", status = 200) => {
    return res.status(status).json({ success: true, data, message })
  }

  res.sendError = (error, status = 500) => {
    const err = new Error()
    err.message = error
    err.status = status
    // error middleware capture handle the rest
    return err
  }

  next()
}

// get client ip address like reverse proxy config
function getIP(req) {
  req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress // proxy_set_header X-Real-IP $remote_addr;
}

// create file URL with specific environnement
function createFileURL(req = null) {
  const isFile = req.file
  if (!isFile) return null
  const isHost = process.env.SEVER_HOST
  const filename = req.file.filename
  return isHost
    ? `${isHost}/file/${filename}`
    : `${req.protocol}://${req.get("host")}/file/${req.file.filename}`
}

export { responseSender, getIP, createFileURL }
