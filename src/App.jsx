import { useState } from 'react'
import SpectrumViz from './SpectrumViz'
import PowerViz from './PowerViz'

export default function App() {
  const [page, setPage] = useState('frequency')

  return (
    <div className="app-shell">
      <nav className="page-tabs" aria-label="Switch visualization">
        <button
          type="button"
          className={`page-tab ${page === 'frequency' ? 'page-tab--active' : ''}`}
          onClick={() => setPage('frequency')}
        >
          <span className="page-tab-icon">〜</span>
          Frequency (Hz)
        </button>
        <button
          type="button"
          className={`page-tab ${page === 'power' ? 'page-tab--active' : ''}`}
          onClick={() => setPage('power')}
        >
          <span className="page-tab-icon">⚡</span>
          Power (W)
        </button>
      </nav>

      {page === 'frequency' ? <SpectrumViz /> : <PowerViz />}
    </div>
  )
}
