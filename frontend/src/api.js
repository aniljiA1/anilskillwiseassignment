const BASE = import.meta.env.VITE_API_URL || '/api';

async function handleJSONResponse(res) {
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const err = json?.error || json?.message || `HTTP ${res.status}`;
    throw new Error(err);
  }
  return res.json().catch(() => ({}));
}

export async function fetchProducts() {
  const res = await fetch(`${BASE}/products`);
  return handleJSONResponse(res);
}

export async function searchProducts(q) {
  const res = await fetch(`${BASE}/products/search?name=${encodeURIComponent(q || '')}`);
  return handleJSONResponse(res);
}

export async function importCSV(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${BASE}/products/import`, { method: 'POST', body: fd });
  return handleJSONResponse(res);
}

export async function exportCSV() {
  const res = await fetch(`${BASE}/products/export`);
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function updateProduct(id, payload) {
  const res = await fetch(`${BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJSONResponse(res);
}

export async function deleteProduct(id) {
  const res = await fetch(`${BASE}/products/${id}`, { method: 'DELETE' });
  return handleJSONResponse(res);
}

export async function addProduct(payload) {
  const res = await fetch(`${BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJSONResponse(res);
}

export async function getHistory(id) {
  const res = await fetch(`${BASE}/products/${id}/history`);
  return handleJSONResponse(res);
}
