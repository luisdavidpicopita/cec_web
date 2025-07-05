import { Router } from 'express'

const router = Router()

// PÁGINA PRINCIPAL

router.get('/', (req, res) => {
    res.render('index');
});

// ¿QUÉ ES EL CEC? 

router.get('/que_es_el_cec', (req, res) => {
    res.render('que_es_el_cec');
});

// PERTENENCIA AL CEC

router.get('/pertenencia_al_cec', (req, res) => {
    res.render('pertenencia_al_cec');
});

// ÁREAS DEL CEC

router.get('/areas_del_cec', (req, res) => {
    res.render('areas_del_cec');
});

// CONTACTO

router.get('/contacto', (req, res) => {
    res.render('contacto');
});















































router.get('/a', async (req, res) => {
  try {
    const result = await req.pool.query('SELECT * FROM usuario');
    res.render('a', { data: result.rows }); 
  } catch (error) {
    console.error('Error en consulta:', error);
    res.status(500).send('Error en la base de datos');
  }
});

export default router