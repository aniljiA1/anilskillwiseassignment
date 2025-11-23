import React from 'react'

export default function Header({
  query, setQuery,
  categories, categoryFilter, setCategoryFilter,
  onImport, onExport, onAdd
}) {
  return (
    <header className="header">
      <div className="header-left">
        <input
          className="search"
          placeholder="Search products by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="header-right">
        <button className="btn secondary" onClick={onAdd}>Add New Product</button>
        <button className="btn secondary" onClick={onImport}>Import</button>
        <button className="btn" onClick={onExport}>Export</button>
      </div>
    </header>
  )
}
