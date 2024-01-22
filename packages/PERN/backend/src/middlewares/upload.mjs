import multer from "multer"
import fs from "fs"
import path, { dirname } from "path"
import { fileURLToPath } from "url"

const MIMES_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
}

export const fileStorageMiddleware = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./uploads")
  },
  filename(req, file, cb) {
    const getFilename = file.originalname.split(".")[0].split(" ").join("_")
    const getExtension = MIMES_TYPES[file.mimetype]
    if (!getExtension) cb("file extension not supported")
    cb(null, `${getFilename}_${Date.now()}.${getExtension}`)
  },
})

export const rm = (file = "") => {
  if (file && fs.existsSync(file)) {
    // detect if link or not
    const isLink = file.startsWith("http")
    const fileDir = path.join(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
      "uploads",
    )
    const fileToRemove = isLink ? file.split("/file/")[1] : file
    fs.unlink(path.join(fileDir, fileToRemove))
  }
}
