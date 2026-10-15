import React, { useState } from 'react';
import { Send, CheckCircle2, AlertOctagon, Clock, ArrowRight, CornerDownRight } from 'lucide-react';

export default function ResourceRequestPanel({
  numProcesses,
  numResources,
  allocation,
  maxMatrix,
  available,
  onRequestResource,
  onApplyNewState,
  isLoading,
}) {
  const [selectedProcess, setSelectedProcess] = useState(0);
  const [requestVector, setRequestVector] = useState(
    new Array(numResources).fill(0)
  );
  const [requestResult, setRequestResult] = useState(null);
  const [requestError, setRequestError] = useState(null);

  // Sync request vector size when numResources changes
  React.useEffect(() => {
    setRequestVector((prev) => {
      if (numResources > prev.length) {
        return [...prev, ...new Array(numResources - prev.length).fill(0)];
      }
      return prev.slice(0, numResources);
    });
  }, [numResources]);

  // Clamp selected process if numProcesses decreased
  React.useEffect(() => {
    if (selectedProcess >= numProcesses) {
      setSelectedProcess(Math.max(0, numProcesses - 1));
    }
  }, [numProcesses, selectedProcess]);

  const resourceNames = Array.from({ length: numResources }, (_, j) =>
    String.fromCharCode(65 + j)
  );

  const handleVectorChange = (colIdx, val) => {
    const num = val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0);
    setRequestVector((prev) =>
      prev.map((v, i) => (i === colIdx ? num : v))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRequestError(null);
    setRequestResult(null);

    try {
      const res = await onRequestResource(selectedProcess, requestVector);
      setRequestResult(res);
    } catch (err) {
      setRequestError(err.message || 'Request failed.');
    }
  };

  const handleApply = () => {
    if (requestResult?.new_state) {
      onApplyNewState(requestResult.new_state);
      setRequestResult(null);
    }
  };

  // Remaining need of selected process
  const currentNeed = resourceNames.map((_, j) => {
    const mVal = maxMatrix[selectedProcess]?.[j] ?? 0;
    const aVal = allocation[selectedProcess]?.[j] ?? 0;
    return Math.max(0, mVal - aVal);
  });

  return (
    <div className="glass-card" style={{ marginTop: '0.5rem' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">Dynamic Resource-Request Algorithm</h2>
          <p className="card-subtitle">
            Simulate an active process requesting additional resource instances
          </p>
        </div>
      </div>

      <div className="request-panel">
        {/* Request Form */}
        <form onSubmit={handleSubmit} className="request-form-card">
          <div className="form-group">
            <label className="form-label">Select Requesting Process:</label>
            <select
              className="select-input"
              value={selectedProcess}
              onChange={(e) => setSelectedProcess(Number(e.target.value))}
              disabled={isLoading}
            >
              {Array.from({ length: numProcesses }).map((_, i) => (
                <option key={i} value={i}>
                  Process P{i}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                Request Vector:
              </label>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Current Need(P{selectedProcess}): [{currentNeed.join(', ')}]
              </span>
            </div>

            <div className="vector-inputs">
              {resourceNames.map((name, j) => (
                <div key={name} className="vector-item">
                  <span>{name}</span>
                  <input
                    type="number"
                    min="0"
                    className="matrix-input"
                    value={requestVector[j] ?? 0}
                    onChange={(e) => handleVectorChange(j, e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={isLoading}
          >
            <Send size={16} />
            <span>Submit Resource Request</span>
          </button>
        </form>

        {/* Request Outcome / Response Viewer */}
        <div className="request-form-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {requestError && (
            <div
              style={{
                background: 'var(--unsafe-red-light)',
                border: '1px solid var(--unsafe-red-border)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--unsafe-red)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <AlertOctagon size={18} />
                <span>Request Denied / Error</span>
              </div>
              <p style={{ fontSize: '0.875rem' }}>{requestError}</p>
            </div>
          )}

          {requestResult && (
            <div>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: requestResult.granted
                    ? 'var(--safe-green-light)'
                    : requestResult.reason.toLowerCase().includes('wait')
                    ? 'var(--warning-amber-light)'
                    : 'var(--unsafe-red-light)',
                  border: `1px solid ${
                    requestResult.granted
                      ? 'var(--safe-green-border)'
                      : requestResult.reason.toLowerCase().includes('wait')
                      ? 'var(--warning-amber)'
                      : 'var(--unsafe-red-border)'
                  }`,
                  color: requestResult.granted
                    ? 'var(--safe-green)'
                    : requestResult.reason.toLowerCase().includes('wait')
                    ? 'var(--warning-amber)'
                    : 'var(--unsafe-red)',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.95rem' }}>
                  {requestResult.granted ? (
                    <CheckCircle2 size={18} />
                  ) : requestResult.reason.toLowerCase().includes('wait') ? (
                    <Clock size={18} />
                  ) : (
                    <AlertOctagon size={18} />
                  )}
                  <span>
                    {requestResult.granted
                      ? 'REQUEST GRANTED'
                      : requestResult.reason.toLowerCase().includes('wait')
                      ? 'PROCESS MUST WAIT'
                      : 'REQUEST DENIED (ROLLED BACK)'}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    marginTop: '0.5rem',
                    lineHeight: 1.5,
                  }}
                >
                  {requestResult.reason}
                </p>
              </div>

              {requestResult.granted && requestResult.new_state && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    New Available: [{requestResult.new_state.available.join(', ')}]
                  </div>

                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleApply}
                    style={{ justifyContent: 'center' }}
                  >
                    <CornerDownRight size={16} />
                    <span>Apply New State to Workspace</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {!requestError && !requestResult && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0' }}>
              <p style={{ fontSize: '0.9rem' }}>
                Select a process and enter resource units to simulate dynamic allocation.
              </p>
              <p style={{ fontSize: '0.78rem', marginTop: '0.4rem' }}>
                Evaluates: 1) Request ≤ Need &nbsp;|&nbsp; 2) Request ≤ Available &nbsp;|&nbsp; 3) Pretend Allocate & Safe Check.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
