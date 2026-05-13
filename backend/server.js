import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sqlite3 from 'sqlite3';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 5000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';
const DB_FILE = join(__dirname, 'data', 'store.db');
const uploadDir = join(__dirname, 'uploads');

mkdirSync(dirname(DB_FILE), { recursive: true });
mkdirSync(uploadDir, { recursive: true });

const db = new sqlite3.Database(DB_FILE);
const clients = new Set();

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_, file, cb) => {
      const safeExt = extname(file.originalname || '').toLowerCase() || '.jpg';
      cb(null, `${Date.now()}-${randomUUID()}${safeExt}`);
    },
  }),
});

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadDir));

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

function sendError(res, status, message) {
  res.status(status).json({ error: message });
}

function broadcast(type, payload) {
  const event = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  clients.forEach((client) => client.write(event));
}

function toProductPayload(input) {
  const name = String(input.name || '').trim();
  if (!name) throw new Error('Product name is required.');

  const slug = String(input.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '');
  if (!slug) throw new Error('Product slug is required.');

  return {
    slug,
    name,
    category: String(input.category || 'Dog'),
    kind: String(input.kind || 'Product'),
    price: String(input.price || 'Price on request'),
    numericPrice: Number(input.numericPrice || 0),
    stock: Number(input.stock || 0),
    status: String(input.status || 'In stock'),
    care: String(input.care || ''),
    image: String(input.image || ''),
    visual: String(input.visual || 'visual-dog'),
  };
}

async function fetchOverview() {
  const products = await all('SELECT * FROM products ORDER BY datetime(createdAt) DESC');
  const orders = await all(
    'SELECT _id, customerName as customer_name, totalAmount, paymentStatus, orderStatus, createdAt, updatedAt FROM orders ORDER BY datetime(createdAt) DESC',
  );
  const contacts = await all('SELECT * FROM contacts ORDER BY datetime(createdAt) DESC');

  return {
    products,
    orders: orders.map((order) => ({
      _id: order._id,
      customer: { name: order.customer_name },
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })),
    contacts,
    metrics: {
      products: products.length,
      orders: orders.length,
      contacts: contacts.length,
      pendingPayments: orders.filter((order) => order.paymentStatus === 'pending').length,
    },
  };
}

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS products (
      _id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      kind TEXT NOT NULL,
      price TEXT NOT NULL,
      numericPrice INTEGER NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      care TEXT NOT NULL,
      image TEXT NOT NULL,
      visual TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      _id TEXT PRIMARY KEY,
      customerName TEXT NOT NULL,
      totalAmount INTEGER NOT NULL,
      paymentStatus TEXT NOT NULL,
      orderStatus TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS contacts (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      interest TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `);

  const productCount = await get('SELECT COUNT(*) as count FROM products');
  if (!productCount?.count) {
    const createdAt = new Date().toISOString();
    const seedProducts = [
      ['dog', 'dog', 'Bruno', 'Dog', 'Adoption', 'Adoption fee: INR 2,500', 2500, 1, 'Ready for home visit', 'Daily walks, brushing twice weekly, vaccination record included.', '/images/dog.jpg', 'visual-dog'],
      ['cat', 'cat', 'Luna', 'Cat', 'Adoption', 'Adoption fee: INR 1,800', 1800, 1, 'Vaccinated', 'Indoor home, litter trained, calm evening routine preferred.', '/images/cat.jpg', 'visual-cat'],
      ['food', 'food', 'Balanced Pet Food', 'Food', 'Product', 'From INR 399', 399, 18, 'Best seller', 'Vet-guided nutrition packs with portion suggestions.', '/images/food.jpg', 'visual-food'],
      ['toys', 'toys', 'Play & Enrichment Toys', 'Toys', 'Product', 'From INR 149', 149, 32, 'New arrivals', 'Chew-safe, puzzle, feather, rope, and activity toys.', '/images/toys.jpg', 'visual-toys'],
    ];
    for (const product of seedProducts) {
      await run(
        `INSERT INTO products (_id, slug, name, category, kind, price, numericPrice, stock, status, care, image, visual, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [...product, createdAt],
      );
    }
  }

  const orderCount = await get('SELECT COUNT(*) as count FROM orders');
  if (!orderCount?.count) {
    await run(
      `INSERT INTO orders (_id, customerName, totalAmount, paymentStatus, orderStatus, createdAt) VALUES
       ('order-1001', 'Aarav Sharma', 2500, 'pending', 'placed', '2026-05-08T09:30:00.000Z'),
       ('order-1002', 'Maya Kapoor', 899, 'paid', 'confirmed', '2026-05-08T11:45:00.000Z')`,
    );
  }

  const contactCount = await get('SELECT COUNT(*) as count FROM contacts');
  if (!contactCount?.count) {
    await run(
      `INSERT INTO contacts (_id, name, email, phone, interest, message, status, createdAt) VALUES
       ('message-1001', 'Riya Mehta', 'riya@example.com', '+91 90000 22222', 'Grooming', 'I want to book a grooming appointment for my dog.', 'new', '2026-05-08T10:10:00.000Z'),
       ('message-1002', 'Kabir Rao', 'kabir@example.com', '+91 90000 33333', 'Products', 'Do you have aquarium starter kits available?', 'read', '2026-05-08T12:15:00.000Z')`,
    );
  }
}

app.get('/api/admin/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();
  res.write('event: connected\ndata: {"ok": true}\n\n');
  clients.add(res);
  req.on('close', () => clients.delete(res));
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'pawsphere-backend' });
});

app.get('/api/admin/overview', async (_req, res) => {
  try {
    res.json(await fetchOverview());
  } catch (error) {
    sendError(res, 500, error.message || 'Could not fetch admin overview.');
  }
});

app.get('/api/products', async (_req, res) => {
  try {
    const products = await all('SELECT * FROM products ORDER BY datetime(createdAt) DESC');
    res.json(products);
  } catch (error) {
    sendError(res, 500, error.message || 'Could not fetch products.');
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = toProductPayload(req.body);
    const _id = randomUUID();
    const now = new Date().toISOString();
    await run(
      `INSERT INTO products (_id, slug, name, category, kind, price, numericPrice, stock, status, care, image, visual, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        _id,
        product.slug,
        product.name,
        product.category,
        product.kind,
        product.price,
        product.numericPrice,
        product.stock,
        product.status,
        product.care,
        product.image,
        product.visual,
        now,
      ],
    );
    const saved = await get('SELECT * FROM products WHERE _id = ?', [_id]);
    const overview = await fetchOverview();
    broadcast('admin:update', overview);
    res.status(201).json(saved);
  } catch (error) {
    sendError(res, 400, error.message || 'Product was not created.');
  }
});

app.patch('/api/products/:productId', async (req, res) => {
  try {
    const existing = await get('SELECT * FROM products WHERE _id = ?', [req.params.productId]);
    if (!existing) return sendError(res, 404, 'Product not found.');

    const payload = toProductPayload({ ...existing, ...req.body });
    const now = new Date().toISOString();
    await run(
      `UPDATE products SET slug = ?, name = ?, category = ?, kind = ?, price = ?, numericPrice = ?, stock = ?, status = ?, care = ?, image = ?, visual = ?, updatedAt = ?
       WHERE _id = ?`,
      [
        payload.slug,
        payload.name,
        payload.category,
        payload.kind,
        payload.price,
        payload.numericPrice,
        payload.stock,
        payload.status,
        payload.care,
        payload.image,
        payload.visual,
        now,
        req.params.productId,
      ],
    );
    const saved = await get('SELECT * FROM products WHERE _id = ?', [req.params.productId]);
    const overview = await fetchOverview();
    broadcast('admin:update', overview);
    res.json(saved);
  } catch (error) {
    sendError(res, 400, error.message || 'Product was not updated.');
  }
});

app.delete('/api/products/:productId', async (req, res) => {
  try {
    const exists = await get('SELECT _id FROM products WHERE _id = ?', [req.params.productId]);
    if (!exists) return sendError(res, 404, 'Product not found.');
    await run('DELETE FROM products WHERE _id = ?', [req.params.productId]);
    const overview = await fetchOverview();
    broadcast('admin:update', overview);
    res.json({ ok: true });
  } catch (error) {
    sendError(res, 400, error.message || 'Product was not deleted.');
  }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return sendError(res, 400, 'Image file is required.');
  res.status(201).json({ imagePath: `/uploads/${req.file.filename}` });
});

app.post('/api/contacts', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const message = String(req.body.message || '').trim();
    if (!name || !message) return sendError(res, 400, 'Name and message are required.');
    const now = new Date().toISOString();
    const _id = randomUUID();
    const payload = {
      _id,
      name,
      email: String(req.body.email || '').trim(),
      phone: String(req.body.phone || '').trim(),
      interest: String(req.body.interest || 'General'),
      message,
      status: 'new',
      createdAt: now,
    };
    await run(
      `INSERT INTO contacts (_id, name, email, phone, interest, message, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [payload._id, payload.name, payload.email, payload.phone, payload.interest, payload.message, payload.status, payload.createdAt],
    );
    const overview = await fetchOverview();
    broadcast('admin:update', overview);
    res.status(201).json(payload);
  } catch (error) {
    sendError(res, 400, error.message || 'Contact request failed.');
  }
});

app.patch('/api/orders/:orderId', async (req, res) => {
  try {
    const orderStatus = String(req.body.orderStatus || '').trim();
    if (!orderStatus) return sendError(res, 400, 'orderStatus is required.');
    const exists = await get('SELECT _id FROM orders WHERE _id = ?', [req.params.orderId]);
    if (!exists) return sendError(res, 404, 'Order not found.');
    const now = new Date().toISOString();
    await run('UPDATE orders SET orderStatus = ?, updatedAt = ? WHERE _id = ?', [orderStatus, now, req.params.orderId]);
    const updated = await get('SELECT * FROM orders WHERE _id = ?', [req.params.orderId]);
    const overview = await fetchOverview();
    broadcast('admin:update', overview);
    res.json({
      _id: updated._id,
      customer: { name: updated.customerName },
      totalAmount: updated.totalAmount,
      paymentStatus: updated.paymentStatus,
      orderStatus: updated.orderStatus,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    sendError(res, 400, error.message || 'Order update failed.');
  }
});

app.patch('/api/contacts/:contactId', async (req, res) => {
  try {
    const status = String(req.body.status || '').trim();
    if (!status) return sendError(res, 400, 'status is required.');
    const exists = await get('SELECT _id FROM contacts WHERE _id = ?', [req.params.contactId]);
    if (!exists) return sendError(res, 404, 'Message not found.');
    const now = new Date().toISOString();
    await run('UPDATE contacts SET status = ?, updatedAt = ? WHERE _id = ?', [status, now, req.params.contactId]);
    const updated = await get('SELECT * FROM contacts WHERE _id = ?', [req.params.contactId]);
    const overview = await fetchOverview();
    broadcast('admin:update', overview);
    res.json(updated);
  } catch (error) {
    sendError(res, 400, error.message || 'Contact update failed.');
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`PawSphere backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database', error);
    process.exit(1);
  });
