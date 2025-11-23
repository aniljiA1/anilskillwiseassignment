import React from 'react'
import ProductRow from './ProductRow'

export default function ProductsTable({ products, loading, onRefresh, onSelect }) {
  return (
    <div className="table-card">
      {loading ? (
        <div className="center">Loading products…</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Unit</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan="8" className="center">No products found</td></tr>
              )}
              {products.map((p) => (
                <ProductRow key={p.id} product={p} onRefresh={onRefresh} onSelect={() => onSelect(p)} />
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
