import React, { useEffect, useState, useMemo } from 'react'
import Header from './components/Header'
import ProductsTable from './components/ProductsTable'
import ImportModal from './components/ImportModal'
import HistoryPanel from './components/HistoryPanel'
import { fetchProducts, searchProducts } from './api'
import { ToastContainer, toast } from 'react-toastify'

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (err) {
      toast.error('Failed to load products: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // search (server-side)
  useEffect(() => {
    let mounted = true
    const t = setTimeout(async () => {
      try {
        if (!query) {
          await loadAll()
          return
        }
        const res = await searchProducts(query)
        if (mounted) setProducts(res)
      } catch (err) {
        toast.error('Search failed: ' + err.message)
      }
    }, 300)
    return () => { mounted = false; clearTimeout(t) }
  }, [query])

  const categories = useMemo(() => {
    const s = new Set()
    products.forEach(p => { if (p.category) s.add(p.category) })
    return ['All', ...Array.from(s).sort()]
  }, [products])

  const filtered = useMemo(() => {
    if (!categoryFilter || categoryFilter === 'All') return products
    return products.filter(p => p.category === categoryFilter)
  }, [products, categoryFilter])

  return (
    <div className="app">
      <ToastContainer />
      <Header
        query={query}
        setQuery={setQuery}
        categories={categories}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onImport={() => setShowImport(true)}
        onExport={() => {
          import('./api').then(m => m.exportCSV()).catch(e => toast.error(e.message))
        }}
        onAdd={() => {
          // quick inline add modal could be implemented; we'll show import modal for now
          setShowImport(true)
        }}
      />

      <main className="main">
        <ProductsTable
          products={filtered}
          loading={loading}
          onRefresh={loadAll}
          onSelect={(p) => setSelectedProduct(p)}
        />
      </main>

      {showImport && <ImportModal onClose={() => setShowImport(false)} onImported={() => { setShowImport(false); loadAll(); toast.success('Import complete') }} />}

      {selectedProduct && <HistoryPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />}

    </div>
  )
}
