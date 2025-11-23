import React, { useState } from 'react'
import { importCSV } from '../api'
import { toast } from 'react-toastify'

export default function ImportModal({ onClose, onImported }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  async function onUpload() {
    if (!file) { toast.error('Choose a CSV file'); return }
    setLoading(true)
    try {
      const res = await importCSV(file)
      toast.success(`Added ${res.added || 0}, duplicates ${res.duplicates?.length || 0}`)
      onImported && onImported(res)
    } catch (err) {
      toast.error('Import failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position:'fixed',left:0,top:0,right:0,bottom:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.3)'
    }}>
      <div style={{background:'#fff',padding:20,borderRadius:8,minWidth:420}}>
        <h3>Import CSV</h3>
        <p className="small">Expected columns: name,unit,category,brand,stock,status,image</p>
        <input type="file" accept=".csv" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
        <div style={{marginTop:12,display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={onUpload} disabled={loading}>{loading?'Uploading...':'Upload'}</button>
        </div>
      </div>
    </div>
  )
}
