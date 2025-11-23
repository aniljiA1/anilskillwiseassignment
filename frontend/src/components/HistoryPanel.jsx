import React, { useEffect, useState } from 'react'
import { getHistory } from '../api'
import { toast } from 'react-toastify'

export default function HistoryPanel({ product, onClose }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await getHistory(product.id)
        if (mounted) setLogs(res || [])
      } catch (err) {
        toast.error('Could not load history: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [product])

  return (
    <aside className="panel">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div>
          <strong>{product.name}</strong><div className="small">History</div>
        </div>
        <button className="action-btn" onClick={onClose}>Close</button>
      </div>

      {loading ? <div className="center">Loading…</div> : (
        <div>
          {logs.length === 0 && <div className="small center">No inventory changes recorded.</div>}
          {logs.map(l => (
            <div key={l.id} style={{padding:'10px 0',borderBottom:'1px solid #f2f2f2'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div className="small">{new Date(l.timestamp).toLocaleString()}</div>
                <div className="small">{l.changed_by}</div>
              </div>
              <div style={{marginTop:6}}>
                <strong>Old:</strong> {l.old_stock} &nbsp; <strong>→</strong> &nbsp; <strong>New:</strong> {l.new_stock}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}
