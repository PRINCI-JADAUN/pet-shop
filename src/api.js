export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'Backend request failed.');
  }

  return data;
}

export function getAdminOverview() {
  return request('/api/admin/overview');
}

export function getProducts() {
  return request('/api/products');
}

export function createProduct(product) {
  return request('/api/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export function updateProduct(productId, payload) {
  return request(`/api/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(productId) {
  return request(`/api/products/${productId}`, {
    method: 'DELETE',
  });
}

export function updateOrder(orderId, orderStatus) {
  return request(`/api/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ orderStatus }),
  });
}

export function updateContact(messageId, status) {
  return request(`/api/contacts/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function createContact(contact) {
  return request('/api/contacts', {
    method: 'POST',
    body: JSON.stringify(contact),
  });
}

export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || 'Image upload failed.');
  }
  return data;
}

export function resolveImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/uploads/')) return `${API_BASE_URL}${path}`;
  return path;
}
