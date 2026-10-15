import React from 'react';
import { Database, RotateCcw, Play, Plus, Minus, AlertTriangle } from 'lucide-react';

export default function MatrixEditor({
  numProcesses,
  numResources,
  setNumProcesses,
  setNumResources,
  allocation,
  setAllocation,
  maxMatrix,
  setMaxMatrix,
  available,
  setAvailable,
  onLoadSample,
  onCheckSafety,
  isLoading,
}) {
  const resourceNames = Array.from({ length: numResources }, (_, j) =>
    String.fromCharCode(65 + j)
  );

  // Dimension Resizing with value preservation
  const handleProcessCountChange = (delta) => {
    const nextCount = Math.max(1, Math.min(10, numProcesses + delta));
    if (nextCount === numProcesses) return;

    setNumProcesses(nextCount);
    setAllocation((prev) => {
      if (nextCount > prev.length) {
        // Add new row with zeros
        const newRows = Array.from({ length: nextCount - prev.length }, () =>
          new Array(numResources).fill(0)
        );
        return [...prev, ...newRows];
      } else {
        // Slice
        return prev.slice(0, nextCount);
      }
    });

    setMaxMatrix((prev) => {
      if (nextCount > prev.length) {
        const newRows = Array.from({ length: nextCount - prev.length }, () =>
          new Array(numResources).fill(0)
        );
        return [...prev, ...newRows];
      } else {
        return prev.slice(0, nextCount);
      }
    });
  };

  const handleResourceCountChange = (delta) => {
    const nextCount = Math.max(1, Math.min(10, numResources + delta));
    if (nextCount === numResources) return;

    setNumResources(nextCount);
    setAllocation((prev) =>
      prev.map((row) => {
        if (nextCount > row.length) {
          return [...row, ...new Array(nextCount - row.length).fill(0)];
        }
        return row.slice(0, nextCount);
      })
    );

    setMaxMatrix((prev) =>
      prev.map((row) => {
        if (nextCount > row.length) {
          return [...row, ...new Array(nextCount - row.length).fill(0)];
        }
        return row.slice(0, nextCount);
      })
    );

    setAvailable((prev) => {
      if (nextCount > prev.length) {
        return [...prev, ...new Array(nextCount - prev.length).fill(0)];
      }
      return prev.slice(0, nextCount);
    });
  };

  const handleCellChange = (matrixType, i, j, value) => {
    const num = value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0);

    if (matrixType === 'allocation') {
      const next = allocation.map((r, rowIdx) =>
        rowIdx === i ? r.map((c, colIdx) => (colIdx === j ? num : c)) : [...r]
      );
      setAllocation(next);
    } else if (matrixType === 'max') {
      const next = maxMatrix.map((r, rowIdx) =>
        rowIdx === i ? r.map((c, colIdx) => (colIdx === j ? num : c)) : [...r]
      );
      setMaxMatrix(next);
    } else if (matrixType === 'available') {
      const next = available.map((val, idx) => (idx === j ? num : val));
      setAvailable(next);
    }
  };

  const handleResetZeros = () => {
    setAllocation(
      Array.from({ length: numProcesses }, () => new Array(numResources).fill(0))
    );
    setMaxMatrix(
      Array.from({ length: numProcesses }, () => new Array(numResources).fill(0))
    );
    setAvailable(new Array(numResources).fill(0));
  };

  // Client-side validation checks
  const errors = [];
  for (let i = 0; i < numProcesses; i++) {
    for (let j = 0; j < numResources; j++) {
      const allocVal = allocation[i]?.[j] ?? 0;
      const maxVal = maxMatrix[i]?.[j] ?? 0;
      if (allocVal > maxVal) {
        errors.push(
          `P${i} [Resource ${resourceNames[j]}]: Allocation (${allocVal}) cannot exceed Max (${maxVal}).`
        );
      }
    }
  }

  // Calculate total resources = sum(alloc) + available
  const totalResources = resourceNames.map((_, j) => {
    const sumAlloc = allocation.reduce((sum, row) => sum + (row[j] || 0), 0);
    return sumAlloc + (available[j] || 0);
  });

  return (
    <div className="glass-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">System State & Matrices</h2>
          <p className="card-subtitle">
            Configure system dimensions and enter Allocation, Max Claim, and Available resource vectors
          </p>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-secondary"
            onClick={onLoadSample}
            disabled={isLoading}
            title="Load the 5-process, 3-resource classic textbook problem"
          >
            <Database size={16} />
            <span>Load Sample Data</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleResetZeros}
            disabled={isLoading}
            title="Reset all matrix values to 0"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={onCheckSafety}
            disabled={isLoading || errors.length > 0}
            title="Evaluate deadlock avoidance and find safe execution sequence"
          >
            <Play size={16} />
            <span>Check Safety</span>
          </button>
        </div>
      </div>

      {/* Dimension Controls Bar */}
      <div className="controls-bar">
        <div className="dim-control-group">
          <div className="dim-control">
            <span className="dim-label">Processes (n):</span>
            <div className="counter-stepper">
              <button
                className="counter-btn"
                onClick={() => handleProcessCountChange(-1)}
                disabled={numProcesses <= 1 || isLoading}
                aria-label="Decrease process count"
              >
                <Minus size={14} />
              </button>
              <span className="counter-val">{numProcesses}</span>
              <button
                className="counter-btn"
                onClick={() => handleProcessCountChange(1)}
                disabled={numProcesses >= 10 || isLoading}
                aria-label="Increase process count"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="dim-control">
            <span className="dim-label">Resources (m):</span>
            <div className="counter-stepper">
              <button
                className="counter-btn"
                onClick={() => handleResourceCountChange(-1)}
                disabled={numResources <= 1 || isLoading}
                aria-label="Decrease resource count"
              >
                <Minus size={14} />
              </button>
              <span className="counter-val">{numResources}</span>
              <button
                className="counter-btn"
                onClick={() => handleResourceCountChange(1)}
                disabled={numResources >= 10 || isLoading}
                aria-label="Increase resource count"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          Tip: Max claim must always be ≥ Allocation for every cell.
        </div>
      </div>

      {/* Validation Banner if Allocation > Max */}
      {errors.length > 0 && (
        <div
          style={{
            background: 'var(--unsafe-red-light)',
            border: '1px solid var(--unsafe-red-border)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            fontSize: '0.85rem',
            color: 'var(--unsafe-red)',
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Input Error:</strong>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
              {errors.slice(0, 3).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
              {errors.length > 3 && <li>...and {errors.length - 3} more errors</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Editable Matrices Grid */}
      <div className="matrices-grid">
        {/* Allocation Matrix */}
        <div className="matrix-card">
          <div className="matrix-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Allocation Matrix</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Currently held resources</p>
            </div>
            <span className="matrix-tag">Alloc</span>
          </div>

          <div className="table-responsive">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th className="proc-col">Proc</th>
                  {resourceNames.map((name) => (
                    <th key={name}>{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: numProcesses }).map((_, i) => (
                  <tr key={i}>
                    <td className="proc-col">
                      <span className="proc-badge">P{i}</span>
                    </td>
                    {Array.from({ length: numResources }).map((_, j) => {
                      const isInvalid = (allocation[i]?.[j] ?? 0) > (maxMatrix[i]?.[j] ?? 0);
                      return (
                        <td key={j}>
                          <input
                            type="number"
                            min="0"
                            className={`matrix-input ${isInvalid ? 'invalid-cell' : ''}`}
                            value={allocation[i]?.[j] ?? 0}
                            onChange={(e) => handleCellChange('allocation', i, j, e.target.value)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Max Matrix */}
        <div className="matrix-card">
          <div className="matrix-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Max Demand Matrix</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Declared maximum claim</p>
            </div>
            <span className="matrix-tag">Max</span>
          </div>

          <div className="table-responsive">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th className="proc-col">Proc</th>
                  {resourceNames.map((name) => (
                    <th key={name}>{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: numProcesses }).map((_, i) => (
                  <tr key={i}>
                    <td className="proc-col">
                      <span className="proc-badge">P{i}</span>
                    </td>
                    {Array.from({ length: numResources }).map((_, j) => (
                      <td key={j}>
                        <input
                          type="number"
                          min="0"
                          className="matrix-input"
                          value={maxMatrix[i]?.[j] ?? 0}
                          onChange={(e) => handleCellChange('max', i, j, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Available Vector & Total Resources summary */}
      <div className="available-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Available Resources Vector</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Free unallocated instances</p>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total System Resources:{' '}
            <strong style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
              [{totalResources.join(', ')}]
            </strong>
          </div>
        </div>

        <div className="available-items">
          {resourceNames.map((name, j) => (
            <div key={name} className="avail-card">
              <span className="avail-res-name">{name}:</span>
              <input
                type="number"
                min="0"
                className="matrix-input"
                style={{ width: '60px' }}
                value={available[j] ?? 0}
                onChange={(e) => handleCellChange('available', 0, j, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
