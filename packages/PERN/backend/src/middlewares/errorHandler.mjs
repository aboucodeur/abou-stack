import dotenv from 'dotenv'
dotenv.config()

const isProd = process.env === 'production'
// capture server error => using new ERROR
export function erroHandler(err, req, res, next) {
  const errorStatus = err.status || 500
  const errorMessage = err.message || 'something went wrong'
  const errorStack = isProd ? null : err.stack
  return res.status(errorStatus).json({
    succes: false,
    message: errorMessage,
    stack: errorStack
  })
}
