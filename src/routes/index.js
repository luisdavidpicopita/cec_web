import { Router } from 'express'

const router = Router()

// PÁGINA HOME
router.get('/', (req, res) => {
    res.render('index');
});

// ¿QUÉ ES EL CEC? 

// NATURALEZA E HISTORIA

router.get('/naturaleza_historia', (req, res) => {
    res.render('naturaleza_historia');
});

// CAMPAMENTOS

router.get('/campamentos', (req, res) => {
    res.render('campamentos');
});

// NUESTRA LEY

router.get('/nuestra_ley', (req, res) => {
    res.render('nuestra_ley');
});













































router.get('/principal', async (req, res) => {
  try {
    const result = await req.pool.query('SELECT * FROM usuario');
    res.render('principal', { data: result.rows }); 
  } catch (error) {
    console.error('Error en consulta:', error);
    res.status(500).send('Error en la base de datos');
  }
});

export default router