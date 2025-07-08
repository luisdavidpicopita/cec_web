import { Router } from 'express';
import upload from '../middlewares/upload.js';

const router = Router();

// PÁGINA PRINCIPAL
router.get('/', async (req, res) => {
  try {
    const carrusel = await req.pool.query(`
      SELECT a.id, a.titulo, a.foto, p_origen.ruta AS ruta_origen, 
             p_destino.ruta AS ruta_destino, pa.seccion
      FROM articulo a
      INNER JOIN pagina_articulo pa ON pa.articulo_id = a.id
      INNER JOIN pagina p_origen ON p_origen.id = pa.pagina_id
      LEFT JOIN pagina p_destino ON p_destino.id = pa.pagina_destino_id
      WHERE p_origen.ruta = '/' AND pa.elemento = 1 AND a.visible = TRUE
      ORDER BY pa.orden DESC
    `);

    const tarjetaResult = await req.pool.query(`
      SELECT a.id, a.titulo, a.texto_corto, a.foto, p_origen.ruta AS ruta_origen, 
             p_destino.ruta AS ruta_destino, pa.seccion
      FROM articulo a
      INNER JOIN pagina_articulo pa ON pa.articulo_id = a.id
      INNER JOIN pagina p_origen ON p_origen.id = pa.pagina_id
      LEFT JOIN pagina p_destino ON p_destino.id = pa.pagina_destino_id
      WHERE p_origen.ruta = '/' AND pa.elemento = 2 AND a.visible = TRUE
      LIMIT 1;
    `);

    const historiaResult = await req.pool.query(`
      SELECT a.id, a.titulo, a.texto_corto, a.foto, p_origen.ruta AS ruta_origen, 
             p_destino.ruta AS ruta_destino, pa.seccion
      FROM articulo a
      INNER JOIN pagina_articulo pa ON pa.articulo_id = a.id
      INNER JOIN pagina p_origen ON p_origen.id = pa.pagina_id
      LEFT JOIN pagina p_destino ON p_destino.id = pa.pagina_destino_id
      WHERE p_origen.ruta = '/' AND pa.elemento = 3 AND a.visible = TRUE
      LIMIT 1;
    `);

    const areas = await req.pool.query(`
      SELECT a.id, a.titulo, a.foto, a.texto_corto, p_origen.ruta AS ruta_origen, 
             p_destino.ruta AS ruta_destino, pa.seccion
      FROM articulo a
      INNER JOIN pagina_articulo pa ON pa.articulo_id = a.id
      INNER JOIN pagina p_origen ON p_origen.id = pa.pagina_id
      LEFT JOIN pagina p_destino ON p_destino.id = pa.pagina_destino_id
      WHERE p_origen.ruta = '/' AND pa.elemento = 4 AND a.visible = TRUE
      ORDER BY pa.orden DESC
    `);

    res.render('index', {
      carrusel: carrusel.rows,
      tarjeta_cec: tarjetaResult.rows[0] || null,
      historia_cec: historiaResult.rows[0] || null,
      areas: areas.rows
    });
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    res.status(500).send('Error en la base de datos');
  }
});

// QUÉ ES EL CEC
router.get('/que_es_el_cec', async (req, res) => {
  try {
    const cec = await req.pool.query(`
      SELECT a.id, a.titulo, a.foto, a.texto_largo, a.fecha_creacion, 
             a.ultima_modificacion, pa.seccion
      FROM articulo a
      JOIN pagina_articulo pa ON pa.articulo_id = a.id
      JOIN pagina p ON p.id = pa.pagina_id
      WHERE p.ruta = '/que_es_el_cec' AND a.visible = TRUE
      ORDER BY pa.seccion;
    `);

    res.render('que_es_el_cec', { cec: cec.rows });
  } catch (err) {
    console.error('Error cargando artículos por sección:', err);
    res.status(500).send('Error en el servidor');
  }
});

// ÁREAS DEL CEC
router.get('/areas_del_cec', async (req, res) => {
  try {
    const areas = await req.pool.query(`
      SELECT a.id, a.titulo, a.foto, a.texto_largo, a.fecha_creacion, 
             a.ultima_modificacion, pa.seccion, pa.elemento
      FROM articulo a
      JOIN pagina_articulo pa ON pa.articulo_id = a.id
      JOIN pagina p ON p.id = pa.pagina_id
      WHERE p.ruta = '/areas_del_cec' AND a.visible = TRUE
      ORDER BY pa.seccion;
    `);

    res.render('areas_del_cec', { areas: areas.rows });
  } catch (err) {
    console.error('Error cargando artículos por sección:', err);
    res.status(500).send('Error en el servidor');
  }
});

// PERTENENCIA AL CEC
router.get('/pertenencia_al_cec', async (req, res) => {
  try {
    const cec = await req.pool.query(`
      SELECT a.id, a.titulo, a.foto, a.texto_largo, a.fecha_creacion, 
             a.ultima_modificacion, pa.seccion
      FROM articulo a
      JOIN pagina_articulo pa ON pa.articulo_id = a.id
      JOIN pagina p ON p.id = pa.pagina_id
      WHERE p.ruta = '/pertenencia_al_cec' AND a.visible = TRUE
      ORDER BY pa.seccion;
    `);

    res.render('pertenencia_al_cec', { cec: cec.rows });
  } catch (err) {
    console.error('Error cargando artículos por sección:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Otras vistas simples
router.get('/contacto', (req, res) => res.render('contacto'));
router.get('/admin', (req, res) => res.render('admin'));

// FORMULARIO ARTÍCULO - GET
router.get('/formulario_home', async (req, res) => {
  try {
    const usuariosResult = await req.pool.query(`
      SELECT id, nombre1, apellido1 FROM usuario ORDER BY nombre1, apellido1
    `);

    const paginasResult = await req.pool.query(`
      SELECT id, nombre FROM pagina WHERE visible = TRUE ORDER BY nombre
    `);

    res.render('formulario_home', {
      usuarios: usuariosResult.rows,
      paginas: paginasResult.rows
    });
  } catch (error) {
    console.error('Error al cargar formulario:', error);
    res.status(500).send('Error al cargar formulario');
  }
});

// FORMULARIO ARTÍCULO - POST
router.post('/formulario_home', upload.single('foto'), async (req, res) => {
  try {
    const {
      titulo,
      usuario_id,
      texto_corto,
      texto_largo,
      orden: ordenGeneral,
      pagina_destino,
      seccion
    } = req.body;

    let paginas = req.body.pagina;
    if (!Array.isArray(paginas)) paginas = [paginas];

    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await req.pool.query(`
      INSERT INTO articulo (titulo, texto_largo, texto_corto, foto, usuario_id, visible, fecha_creacion)
      VALUES ($1, $2, $3, $4, $5, true, NOW())
      RETURNING id
    `, [titulo, texto_largo, texto_corto, foto, usuario_id]);

    const articuloId = result.rows[0].id;

    for (const paginaId of paginas) {
      const elemento = parseInt(req.body[`elemento_pagina_${paginaId}`]) || 1;

      await req.pool.query(`
        INSERT INTO pagina_articulo (articulo_id, pagina_id, orden, elemento, pagina_destino_id, seccion)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        articuloId,
        paginaId,
        ordenGeneral || 1,
        elemento,
        pagina_destino || null,
        seccion ? parseInt(seccion) : null
      ]);
    }

    res.redirect('/admin');
  } catch (error) {
    console.error('Error al guardar el artículo:', error);
    res.status(500).send('Error al guardar el artículo');
  }
});

export default router;
