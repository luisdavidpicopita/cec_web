import { Router } from 'express';
import upload from '../middlewares/upload.js';

const router = Router();

// PÁGINA PRINCIPALES
router.get('/', async (req, res) => {
  try {
    const result = await req.pool.query(`
      SELECT a.id, a.titulo, a.foto, a.texto_corto
      FROM articulo a
      INNER JOIN pagina_articulo pa ON pa.articulo_id = a.id
      INNER JOIN pagina p ON p.id = pa.pagina_id
      WHERE p.nombre = 'Principal' AND a.visible = TRUE
      ORDER BY a.fecha_creacion DESC
      LIMIT 5
    `);

    res.render('index', { articulos: result.rows });

  } catch (error) {
    console.error('Error al cargar el carrusel:', error);
    res.status(500).send('Error en la base de datos');
  }
});

router.get('/que_es_el_cec', (req, res) => res.render('que_es_el_cec'));
router.get('/pertenencia_al_cec', (req, res) => res.render('pertenencia_al_cec'));
router.get('/areas_del_cec', (req, res) => res.render('areas_del_cec'));
router.get('/contacto', (req, res) => res.render('contacto'));
router.get('/admin', (req, res) => res.render('admin'));

// FORMULARIO ARTÍCULO - GET
router.get('/formulario_home', async (req, res) => {
  try {
    const usuariosResult = await req.pool.query(`
      SELECT id, nombre1, apellido1 
      FROM usuario 
      ORDER BY nombre1, apellido1
    `);

    const paginasResult = await req.pool.query(`
      SELECT id, nombre 
      FROM pagina 
      WHERE visible = TRUE 
      ORDER BY nombre
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
  const { titulo, usuario_id, texto_corto, texto_largo } = req.body;
  const paginas = req.body.pagina; // <-- será un array
  const foto = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Guardar artículo
    const result = await req.pool.query(`
      INSERT INTO articulo (titulo, texto_largo, texto_corto, foto, usuario_id, visible, fecha_creacion)
      VALUES ($1, $2, $3, $4, $5, true, NOW())
      RETURNING id
    `, [titulo, texto_largo, texto_corto, foto, usuario_id]);

    const articuloId = result.rows[0].id;

    // Asociar a cada página
    if (Array.isArray(paginas)) {
      for (const paginaId of paginas) {
        await req.pool.query(`
          INSERT INTO pagina_articulo (articulo_id, pagina_id)
          VALUES ($1, $2)
        `, [articuloId, paginaId]);
      }
    } else {
      // Si solo vino un valor (sin array)
      await req.pool.query(`
        INSERT INTO pagina_articulo (articulo_id, pagina_id)
        VALUES ($1, $2)
      `, [articuloId, paginas]);
    }

    res.redirect('/admin');
  } catch (error) {
    console.error('❌ Error al guardar el artículo:', error);
    res.status(500).send('Error al guardar el artículo');
  }
});


// TEST
router.get('/a', async (req, res) => {
  try {
    const result = await req.pool.query('SELECT * FROM usuario');
    res.render('a', { data: result.rows });
  } catch (error) {
    console.error('Error en consulta:', error);
    res.status(500).send('Error en la base de datos');
  }
});

export default router;
