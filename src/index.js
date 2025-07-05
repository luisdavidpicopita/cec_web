import express from 'express'
import {dirname, join} from 'path'
import { fileURLToPath } from 'url'
import pkg from 'pg'
import indexRoutes from './routes/index.js'
import cors from 'cors'

const { Pool } = pkg

const app = express()

const __dirname = dirname(fileURLToPath(import.meta.url))

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'cec',
  password: '0000',
  port: 5432,
})


app.use(cors({
  origin: 'http://localhost:4200',  
}));

app.use((req, res, next) => {
  req.pool = pool;
  next();
});

pool.query('SELECT NOW()')
  .then(res => console.log('PostgreSQL conectado:', res.rows[0]))
  .catch(err => console.error('Error conexión PostgreSQL:', err))


app.set('views', join(__dirname, 'views'))

app.set('view engine', 'ejs')

app.use(express.static(join(__dirname, 'public')))

app.use(indexRoutes)

app.listen(3000)
console.log('Server is listening on port', 3000)