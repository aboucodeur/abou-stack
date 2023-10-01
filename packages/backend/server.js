import dotenv from "dotenv"
dotenv.config()

import http from "http"
import app from "./src/app.mjs"
// const fs = require("fs")

function normalizePort(val) {
  const port = parseInt(val, 10)
  if (isNaN(port)) return val
  if (port >= 0) return port
  return false
}

function onError(error) {
  if (error.syscall !== "listen") throw error
  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges")
      process.exit(1)
      break
    case "EADDRINUSE":
      console.error(bind + " is already in use")
      process.exit(1)
      break
    default:
      throw error
  }
}

function onListening() {
  const addr = server.address()
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port
  console.log(`Running at ${bind}`)
}

// ** SSL CERTIFICATE
// const options = {
//     key: fs.readFileSync('/etc/letsencrypt/live/ultra-glk.com/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/ultra-glk.com/cert.pem'),
//     ca: fs.readFileSync('/etc/letsencrypt/live/ultra-glk.com/chain.pem')
// }

const server = http.createServer(app)

// ** PORT SETUP
const PORT = process.env.PORT || 3001
const port = normalizePort(PORT)

app.set("port", port)
server.listen(port).on("error", onError).on("listening", onListening)
