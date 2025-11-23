import React, { useState } from 'react'
import { updateProduct, deleteProduct } from '../api'
import { toast } from 'react-toastify'

export default function ProductRow({ product, onRefresh, onSelect }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: product.name || '',
    unit: product.unit || '',
    category: product.category || '',
    brand: product.brand || '',
    stock: product.stock ?? 0,
    status: product.status || (product.stock > 0 ? 'In Stock' : 'Out of Stock')
  })
  const [saving, setSaving] = useState(false)

  function setField(k, v) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function onSave() {
    setSaving(true)
    const payload = { ...form, changedBy: 'admin' }
    // optimistic UI: nothing complex here — call API then refresh
    try {
      await updateProduct(product.id, payload)
      toast.success('Saved')
      setEditing(false)
      onRefresh()
    } catch (err) {
      toast.error('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!confirm('Delete product?')) return
    try {
      await deleteProduct(product.id)
      toast.success('Deleted')
      onRefresh()
    } catch (err) {
      toast.error('Delete failed: ' + err.message)
    }
  }

  return (
    <tr>
      <td>
        {product.image
          ? <img src={product.image} alt={product.name} className="thumb" />
          : <div className="thumb center small">No image</div>
        }
      </td>

      <td style={{ minWidth: 220 }}>
        {editing ? <input className="inline-input" value={form.name} onChange={(e) => setField('name', e.target.value)} /> : <div onClick={onSelect} style={{cursor:'pointer'}}>{product.name}</div>}
      </td>

      <td>{editing ? <input className="inline-input" value={form.unit} onChange={(e)=>setField('unit', e.target.value)} /> : product.unit}</td>
      <td>{editing ? <input className="inline-input" value={form.category} onChange={(e)=>setField('category', e.target.value)} /> : product.category}</td>
      <td>{editing ? <input className="inline-input" value={form.brand} onChange={(e)=>setField('brand', e.target.value)} /> : product.brand}</td>

      <td>{editing ? <input type="number" className="inline-input" value={form.stock} onChange={(e)=>setField('stock', Math.max(0, Number(e.target.value || 0)))} /> : product.stock}</td>

      <td>
        {editing
          ? <select className="select" value={form.status} onChange={(e)=>setField('status', e.target.value)}><option>In Stock</option><option>Out of Stock</option></select>
          : <span className={`status ${product.status === 'In Stock' ? 'in' : 'out'}`}>{product.status}</span>
        }
      </td>

      <td>
        {editing ? (
          <>
            <button className="action-btn" onClick={onSave} disabled={saving}>Save</button>
            <button className="action-btn" onClick={() => { setEditing(false); setForm({ name: product.name, unit: product.unit, category: product.category, brand: product.brand, stock: product.stock, status: product.status }) }}>Cancel</button>
          </>
        ) : (
          <>
            <button className="action-btn" onClick={() => setEditing(true)}>Edit</button>
            <button className="action-btn" onClick={onDelete}>Delete</button>
          </>
        )}
      </td>
    </tr>
  )
}
