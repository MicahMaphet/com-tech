import { useState } from 'react'
import SpectrumViz from './SpectrumViz'
import PowerViz from './PowerViz'
import RangeViz from './RangeViz'

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
        <button
          type="button"
          className={`page-tab ${page === 'range' ? 'page-tab--active' : ''}`}
          onClick={() => setPage('range')}
        >
          <span className="page-tab-icon">↔</span>
          Range (m)
        </button>
      </nav>

      {page === 'frequency' && <SpectrumViz />}
      {page === 'power'     && <PowerViz />}
      {page === 'range'     && <RangeViz />}
    </div>
  )
}
