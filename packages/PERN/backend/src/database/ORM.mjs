import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import path, { dirname } from 'node:path'

dotenv.config()

const config = {
  development: {
    host: '127.0.0.1',
    dialect: process.env.DIALECT,
    timezone: '+00:00',
    port: 5432,
    database: process.env.DATABASE,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    logging: false,
    pool: { max: 100, min: 0, idle: 200000, acquire: 1000000 }
  }
}

const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    port: config.development.port,
    dialect: config.development.dialect,
    dialectOptions: config.development.dialectOptions,
    timezone: config.development.timezone,
    logging: config.development.logging,
    pool: config.development.pool
  }
)

const isProd = process.NODE_ENV === 'production'

function applyConstraint() {
  const pgConstraint = fs.readFileSync(
    path.join(dirname(fileURLToPath(import.meta.url)), 'constraint.sql'),
    'utf8'
  )
  sequelize
    .query(pgConstraint)
    .then((result) => console.log(result))
    .catch((err) => console.error(err))
    .finally(() => console.log('Constraint applied !'))
}

async function _isConnect() {
  return sequelize.authenticate()
}

async function sync(opt) {
  let sqlz = sequelize.sync()

  if (opt === 'force' && isProd) throw new Error('Blocked operations')
  if (opt === 'alter') applyConstraint()
  if (opt) sqlz = sequelize.sync({ [opt]: true, logging: true })

  try {
    await sqlz
    return console.log('> database sync ~ success')
  } catch {
    return console.log('> database sync ~ failed')
  }
}

/**
 * @param {"force" | "alter" | null} opt
 * @returns { new Sequelize().sync() }
 */

export function dbConnect(opt = null) {
  if (opt && !['alter', 'force'].includes(opt)) {
    throw new Error('invalid options')
  }

  _isConnect()
    .then(async () => {
      console.log('> database ~ auth sucess')
      await sync(opt)
    })
    .catch(() => {
      console.log('> database ~ auth failed')
    })
}

// function pour register les modeles rapidement 
// sans perdres le typages