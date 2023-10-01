import express from "express"
import path from "node:path"
import compression from "compression"
import cors from "cors"
import logger from "morgan"
import cookieParser from "cookie-parser"
import { erroHandler, auth } from "./middlewares/index.mjs"
import { responseSender } from "./helpers/index.mjs"
import { fileURLToPath } from "node:url"

var __filename = fileURLToPath(import.meta.url) // use dirname or add suppl ".."
var __dirname = path.dirname(__filename)

// init express app
const app = express()

// app configuration
app.set("trust proxy", true)
app.set("views", path.join(__dirname, "..", "views"))
app.set("view engine", "ejs")
app.disable("x-powered-by")

// app middlewares
const whitelist = ["http://localhost:3000", "https://domain.com"]
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
}

function shouldCompress(req, res) {
  if (req.headers["x-no-compression"]) return false
  return compression.filter(req, res)
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(logger("dev"))
app.use(compression({ filter: shouldCompress }))
// app.use(deny)
app.use(cookieParser()) // req.cookies[key]

// attach to res object
app.use(responseSender)

// app static files
const clientDir = process.pkg
  ? path.join(process.cwd(), "client/build")
  : path.join(__dirname, "../client/build")

const uploadDir = process.pkg
  ? path.join(process.cwd(), "src/uploads")
  : path.join(__dirname, "uploads")

const clientIndex = path.join(clientDir, "index.html")
const clientSitemap = path.join(clientDir, "sitemap.xml")

app.use(express.static(clientDir))
app.use("/file", express.static(uploadDir))

// application here !
app.get("/", (req, res, next) => {
  res.render("index.ejs")
})

// database

// api

// serve sitemap.xml
app.get("/sitemap.xml", ({ res }) => {
  res.set("Content-Type", "application/xml")
  res.sendFile(clientSitemap)
})

// serve client
app.get("*", ({ res }) => {
  res.sendFile(clientIndex, (error) => {
    if (error) res.status(400).json("Impossible de charger l'application")
  })
})

app.use(erroHandler)

export default app
