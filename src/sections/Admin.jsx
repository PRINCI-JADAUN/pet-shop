import { useEffect, useMemo, useState } from 'react';
import {
  API_BASE_URL,
  createProduct as createBackendProduct,
  deleteProduct as deleteBackendProduct,
  getAdminOverview,
  resolveImageUrl,
  updateProduct as updateBackendProduct,
  uploadProductImage,
  updateContact,
  updateOrder,
} from '../api';

const emptyProduct = {
  slug: '',
  name: '',
  category: 'Dog',
  kind: 'Product',
  price: '',
  numericPrice: 0,
  stock: 1,
  status: 'In stock',
  care: '',
  image: '',
  visual: 'visual-dog',
};

function Admin({ onBack }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [activeTab, setActiveTab] = useState('products');
  const [status, setStatus] = useState('Connecting to backend...');
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const metrics = useMemo(
    () => [
      { label: 'Catalog items', value: products.length },
      { label: 'Orders', value: orders.length },
      { label: 'Messages', value: contacts.length },
      { label: 'Pending payments', value: orders.filter((order) => order.paymentStatus === 'pending').length },
    ],
    [contacts.length, orders, products.length],
  );

  const applyOverview = (overview) => {
    setProducts(overview.products || []);
    setOrders(overview.orders || []);
    setContacts(overview.contacts || []);
  };

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const overview = await getAdminOverview();
      applyOverview(overview);
      setStatus('Backend data loaded.');
    } catch (error) {
      setStatus(`Backend unavailable: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();

    const events = new EventSource(`${API_BASE_URL}/api/admin/events`);
    events.addEventListener('connected', () => {
      setIsLive(true);
      setStatus('Live backend updates connected.');
    });
    events.addEventListener('admin:update', (event) => {
      applyOverview(JSON.parse(event.data));
      setStatus('Live update received from backend.');
    });
    events.onerror = () => {
      setIsLive(false);
      setStatus('Live updates paused. Backend will reconnect automatically.');
    };

    return () => events.close();
  }, []);

  const updateProductForm = (event) => {
    const { name, value } = event.target;
    setProductForm((current) => ({
      ...current,
      [name]: name === 'numericPrice' || name === 'stock' ? Number(value) : value,
    }));
  };

  const createProduct = async (event) => {
    event.preventDefault();
    const slug = productForm.slug.trim() || productForm.name.toLowerCase().replace(/\s+/g, '-');

    try {
      await createBackendProduct({
        ...productForm,
        slug,
        status: productForm.status || 'In stock',
      });
      setProductForm(emptyProduct);
      setStatus('Product saved to backend.');
    } catch (error) {
      setStatus(`Product was not saved: ${error.message}`);
    }
  };

  const startEditProduct = (product) => {
    setEditingProductId(product._id);
    setProductForm({
      slug: product.slug || '',
      name: product.name || '',
      category: product.category || 'Dog',
      kind: product.kind || 'Product',
      price: product.price || '',
      numericPrice: Number(product.numericPrice || 0),
      stock: Number(product.stock || 0),
      status: product.status || 'In stock',
      care: product.care || '',
      image: product.image || '',
      visual: product.visual || 'visual-dog',
    });
    setActiveTab('add product');
    setStatus('Editing selected product.');
  };

  const saveProductEdit = async () => {
    const slug = productForm.slug.trim() || productForm.name.toLowerCase().replace(/\s+/g, '-');
    try {
      await updateBackendProduct(editingProductId, {
        ...productForm,
        slug,
      });
      setProductForm(emptyProduct);
      setEditingProductId(null);
      setStatus('Product updated successfully.');
    } catch (error) {
      setStatus(`Product update failed: ${error.message}`);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await deleteBackendProduct(productId);
      if (editingProductId === productId) {
        setEditingProductId(null);
        setProductForm(emptyProduct);
      }
      setStatus('Product deleted from database.');
    } catch (error) {
      setStatus(`Delete failed: ${error.message}`);
    }
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    try {
      await updateOrder(orderId, orderStatus);
      setStatus('Order status saved to backend.');
    } catch (error) {
      setStatus(`Order was not updated: ${error.message}`);
    }
  };

  const closeMessage = async (messageId) => {
    try {
      await updateContact(messageId, 'closed');
      setStatus('Message closed in backend.');
    } catch (error) {
      setStatus(`Message was not updated: ${error.message}`);
    }
  };

  const updateMessageStatus = async (messageId, nextStatus) => {
    try {
      await updateContact(messageId, nextStatus);
      setStatus(`Message ${nextStatus}.`);
    } catch (error) {
      setStatus(`Message was not updated: ${error.message}`);
    }
  };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { imagePath } = await uploadProductImage(file);
      setProductForm((current) => ({ ...current, image: imagePath }));
      setStatus('Image uploaded successfully.');
    } catch (error) {
      setStatus(`Image upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <section className="admin-page section">
      <div className="page-actions">
        <button className="back-btn" type="button" onClick={onBack}>
          Back to shop
        </button>
      </div>

      <div className="admin-heading">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1>Admin features</h1>
        </div>
        <button
          className="primary-btn"
          type="button"
          onClick={loadAdminData}
        >
          Refresh Data
        </button>
      </div>

      <div className={`admin-live-pill ${isLive ? 'online' : 'offline'}`}>
        <span />
        {isLive ? 'Live updates on' : 'Waiting for live updates'}
      </div>

      <div className="admin-metrics">
        {metrics.map((metric) => (
          <article className="admin-metric-card" key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </div>

      <div className="admin-tabs">
        {['products', 'orders', 'messages', 'add product'].map((tab) => (
          <button
            className={activeTab === tab ? 'active' : ''}
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {status && <p className="admin-status">{status}</p>}
      {isLoading && <p className="admin-status">Loading dashboard records...</p>}

      {activeTab === 'products' && (
        <div className="admin-table">
          <div className="admin-row admin-row-head products-row">
            <span>Name</span>
            <span>Category</span>
            <span>Kind</span>
            <span>Price</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {products.map((product) => (
            <div className="admin-row products-row" key={product._id}>
              <span>{product.name}</span>
              <span>{product.category}</span>
              <span>{product.kind}</span>
              <span>{product.price}</span>
              <span>{product.status || 'Available'}</span>
              <span className="admin-row-actions">
                <button className="back-btn" type="button" onClick={() => startEditProduct(product)}>
                  Edit
                </button>
                <button className="back-btn" type="button" onClick={() => deleteProduct(product._id)}>
                  Delete
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="admin-table">
          <div className="admin-row admin-row-head">
            <span>Customer</span>
            <span>Total</span>
            <span>Payment</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {orders.map((order) => (
            <div className="admin-row" key={order._id}>
              <span>{order.customer?.name}</span>
              <span>INR {order.totalAmount}</span>
              <span>{order.paymentStatus}</span>
              <span>{order.orderStatus}</span>
              <select
                value={order.orderStatus}
                onChange={(event) => updateOrderStatus(order._id, event.target.value)}
              >
                <option value="placed">placed</option>
                <option value="confirmed">confirmed</option>
                <option value="packed">packed</option>
                <option value="shipped">shipped</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
                <option value="accepted">accepted</option>
                <option value="rejected">rejected</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="admin-table">
          <div className="admin-row admin-row-head">
            <span>Name</span>
            <span>Email</span>
            <span>Message</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {contacts.map((message) => (
            <div className="admin-row" key={message._id}>
              <span>{message.name}</span>
              <span>{message.email}</span>
              <span>{message.message}</span>
              <span>{message.status}</span>
              <span className="admin-row-actions">
                <button className="back-btn" type="button" onClick={() => updateMessageStatus(message._id, 'accepted')}>
                  Accept
                </button>
                <button className="back-btn" type="button" onClick={() => updateMessageStatus(message._id, 'rejected')}>
                  Reject
                </button>
                <button className="back-btn" type="button" onClick={() => closeMessage(message._id)}>
                  Close
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'add product' && (
        <form className="admin-form admin-product-form" onSubmit={editingProductId ? (event) => {
          event.preventDefault();
          saveProductEdit();
        } : createProduct}>
          <label>
            Slug
            <input name="slug" value={productForm.slug} onChange={updateProductForm} placeholder="puppy-food" />
          </label>
          <label>
            Name
            <input name="name" value={productForm.name} onChange={updateProductForm} placeholder="Puppy Food" />
          </label>
          <label>
            Category
            <select name="category" value={productForm.category} onChange={updateProductForm}>
              <option>Dog</option>
              <option>Cat</option>
              <option>Bird</option>
              <option>Fish</option>
              <option>Rabbit</option>
              <option>Food</option>
              <option>Toys</option>
              <option>Accessories</option>
            </select>
          </label>
          <label>
            Kind
            <select name="kind" value={productForm.kind} onChange={updateProductForm}>
              <option>Adoption</option>
              <option>Pet</option>
              <option>Product</option>
              <option>Service</option>
            </select>
          </label>
          <label>
            Price text
            <input name="price" value={productForm.price} onChange={updateProductForm} placeholder="From INR 399" />
          </label>
          <label>
            Numeric price
            <input name="numericPrice" type="number" value={productForm.numericPrice} onChange={updateProductForm} />
          </label>
          <label>
            Stock
            <input name="stock" type="number" value={productForm.stock} onChange={updateProductForm} />
          </label>
          <label>
            Status
            <input name="status" value={productForm.status} onChange={updateProductForm} />
          </label>
          <label className="admin-wide-field">
            Care / description
            <textarea name="care" rows="4" value={productForm.care} onChange={updateProductForm} />
          </label>
          <label className="admin-wide-field">
            Image URL
            <input name="image" value={productForm.image} onChange={updateProductForm} placeholder="/uploads/abc.jpg" />
          </label>
          <label className="admin-wide-field">
            Upload image
            <input type="file" accept="image/*" onChange={uploadImage} />
          </label>
          {isUploading && <p className="admin-status">Uploading image...</p>}
          {productForm.image && (
            <div className="admin-image-preview">
              <img src={resolveImageUrl(productForm.image)} alt="Product preview" />
            </div>
          )}
          <button className="primary-btn" type="submit">
            {editingProductId ? 'Save Product' : 'Add Product'}
          </button>
          {editingProductId && (
            <button
              className="secondary-btn"
              type="button"
              onClick={() => {
                setEditingProductId(null);
                setProductForm(emptyProduct);
                setStatus('Switched to add product mode.');
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>
      )}
    </section>
  );
}

export default Admin;
