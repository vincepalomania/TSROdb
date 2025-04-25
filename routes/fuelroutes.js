const express = require('express');
const router = express.Router();
const db = require('../model/database');

// Get all fuel items
router.get('/fuel', async (req, res) => {
  const [fuel] = await db.query('SELECT * FROM Fuel');
  res.render('../views/fuel', {title: "All Fuels", fuel })
  console.log(fuel);
});

//Edit fuel details
router.get('/fuel/edit/:id', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Fuel WHERE fuel_id = ?', [req.params.id]);
  const fuel = rows[0]

  res.render('../views/edit', {title: "Fuel Details", fuel });
});

// Update fuel
router.put('/fuel/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { fuel_name, price_per_liter, stock_level } = req.body;
  await db.query('UPDATE Fuel SET fuel_name = ?, price_per_liter = ?, stock_level = ? WHERE fuel_id = ?', 
    [fuel_name, price_per_liter, stock_level, id]);
  res.redirect('/');
});

// Get all products
router.get('/product', async (req, res) => {
  const [product] = await db.query('SELECT * FROM Non_Fuel');
  res.render('../views/product', {title: "All Non-Fuel Products", product})
  console.log(product);
});

// View product by ID
router.get('/product/:id', async (req, res) => {
  const [product] = await db.query('SELECT * FROM Non_Fuel WHERE = ?', [req.params.id]);
  res.render('../views/product', {title: "All Non-Fuel Products", product})
});

//Edit product details
router.get('/product/edit/:id', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Fuel WHERE fuel_id = ?', [req.params.id]);
  const fuel = rows[0]

  res.render('../views/edit', {title: "Product Details", fuel });
});

//Add Product
router.get('/product-create', async (req, res) => {
  res.render('../views/add', {title: "Add Products"});
});

// Add Product
router.post('/product/add', async (req, res) => {
  const { product_name, price, stock_quantity } = req.body;

  console.log(req.body);
  try {
    await db.query(
        'INSERT INTO Non_Fuel (product_name, price, stock_quantity) VALUES (?, ?, ?)',
      [product_name, price, stock_quantity]
    );

    res.redirect('/station/product');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding product');
  }
});


// Update Products in Products
router.put('/product/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { product_name, price, stock_quantity } = req.body;
  await db.query('UPDATE Fuel SET fuel_name = ?, price_per_liter = ?, stock_level = ? WHERE fuel_id = ?', 
    [product_name, price, stock_quantity, id]);
  res.redirect('/product');
});

// Continue

// View sales
router.get('/sales', async (req, res) => {
  const [sales] = await db.query(`
    SELECT s.sale_id, f.fuel_name, nf.product_name, s.quantity_sold, s.total_price, s.sale_date, m.machine_name
    FROM Sales s
    LEFT JOIN Fuel f ON s.fuel_id = f.fuel_id
    LEFT JOIN Non_Fuel nf ON s.product_id = nf.product_id
    LEFT JOIN Machine m ON s.machine_id = m.machine_id
    ORDER BY s.sale_date DESC
    LIMIT 10
  `);
  res.render('../views/sales', {title: "Sales Record", sales});
});

//Update sales
router.post('/sell', async (req, res) => {
  const { fuel_id, quantity_sold, machine_id } = req.body;

  try {
    const [rows] = await db.query('SELECT price_per_liter FROM Fuel WHERE fuel_id = ?', [fuel_id]);

    if (rows.length === 0) return res.status(404).send('Fuel not found');

    const price_per_liter = parseFloat(rows[0].price_per_liter);
    const total_price = price_per_liter * quantity_sold;

    await db.query(
      'INSERT INTO Sales (fuel_id, quantity_sold, total_price, machine_id) VALUES (?, ?, ?, ?)',
      [fuel_id, quantity_sold, total_price, machine_id || null]
    );

    await db.query(
      'UPDATE Fuel SET stock_level = stock_level - ? WHERE fuel_id = ?', // Updates Stocks
      [quantity_sold, fuel_id]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error('Error during fuel sale:', err);
    res.status(500).send('Internal server error');
  }
});

router.post('/sell-product', async (req, res) => {
  const { product_id, quantity_sold, total_price } = req.body;

  try {
    const [rows] = await db.query('SELECT price FROM Non_Fuel WHERE product_id = ?', [product_id]);

    if (rows.length === 0) return res.status(404).send('Product not found');

    const price = parseFloat(rows[0].price);
    const total_price = price * quantity_sold;

    await db.query(
      'INSERT INTO Sales (product_id, quantity_sold, total_price) VALUES (?, ?, ?)',
      [product_id, quantity_sold, total_price]
    );

    await db.query(
      'UPDATE Non_Fuel SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
      [quantity_sold, product_id]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error('Error during product sale:', err);
    res.status(500).send('Internal server error');
  }
});


module.exports = router;