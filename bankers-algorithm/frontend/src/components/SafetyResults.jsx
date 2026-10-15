import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function SafetyResults({
  safetyData,
  numProcesses,
  numResources,
}) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const resourceNames = Array.from({ length: numResources }, (_, j) =>
    String.fromCharCode(65 + j)
  );

  const steps = safetyData?.steps || [];
  const totalSteps = steps.length;

  // Auto-play stepper effect
  useEffect(() => {
    let timer;
    if (isPlaying && totalSteps > 0) {
      timer = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1600);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps]);

  // Reset step index if safetyData changes
  useEffect(() => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
  }, [safetyData]);

  if (!safetyData) return null;

  const currentStep = steps[currentStepIdx];

  return (
    <div className="glass-card" style={{ marginTop: '0.5rem' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">Safety Analysis & Sequence Evaluation</h2>
          <p className="card-subtitle">
            Algorithm simulation results and calculated remaining Need matrix
          </p>
        </div>
      </div>

      {/* SAFE / UNSAFE Status Banner */}
      <div className={`status-banner ${safetyData.is_safe ? 'safe' : 'unsafe'}`}>
        <div className="status-info">
          <span className={`status-pill ${safetyData.is_safe ? 'safe' : 'unsafe'}`}>
            {safetyData.is_safe ? (
              <>
                <CheckCircle2 size={18} />
                SAFE STATE
              </>
            ) : (
              <>
                <XCircle size={18} />
                UNSAFE STATE
              </>
            )}
          </span>

          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>
              {safetyData.is_safe
                ? 'System is Deadlock-Free'
                : 'Potential Deadlock Detected! No safe execution sequence exists.'}
            </div>
            <div style={{ fontSize: '0.84rem', opacity: 0.9 }}>
              {safetyData.is_safe
                ? 'All processes can complete their execution without entering a deadlock.'
                : 'Current available resources cannot satisfy remaining demands of all processes.'}
            </div>
          </div>
        </div>
      </div>

      {/* Safe Sequence Chain (if safe) */}
      {safetyData.is_safe && safetyData.safe_sequence?.length > 0 && (
        <div className="sequence-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Safe Execution Sequence:
            </span>
          </div>

          <div className="sequence-flow">
            {safetyData.safe_sequence.map((pIndex, idx) => (
              <React.Fragment key={pIndex}>
                <div
                  className="process-chip"
                  style={{
                    backgroundColor:
                      currentStep?.process === pIndex
                        ? 'var(--accent-secondary)'
                        : undefined,
                  }}
                >
                  P{pIndex}
                </div>
                {idx < safetyData.safe_sequence.length - 1 && (
                  <div className="seq-arrow">
                    <ArrowRight size={18} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Step-by-Step Trace Stepper */}
      {totalSteps > 0 && (
        <div className="stepper-card">
          <div className="stepper-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                  Step-by-Step Trace Viewer
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Step {currentStepIdx + 1} of {totalSteps}
                </span>
              </div>
            </div>

            <div className="stepper-nav">
              <button
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.8rem' }}
                onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentStepIdx === 0}
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <button
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.8rem' }}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'Pause' : 'Auto-Play'}</span>
              </button>

              <button
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.8rem' }}
                onClick={() =>
                  setCurrentStepIdx((prev) => Math.min(totalSteps - 1, prev + 1))
                }
                disabled={currentStepIdx === totalSteps - 1}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {currentStep && (
            <div>
              <div className="step-details-grid">
                <div
                  className="step-box"
                  style={{
                    borderColor: 'var(--accent-primary)',
                    background: 'rgba(99, 102, 241, 0.05)',
                  }}
                >
                  <div className="step-box-title">Executing Process</div>
                  <div className="step-box-value" style={{ color: 'var(--accent-primary)' }}>
                    P{currentStep.process}
                  </div>
                </div>

                <div className="step-box">
                  <div className="step-box-title">Work Before</div>
                  <div className="step-box-value">
                    [{currentStep.work_before.join(', ')}]
                  </div>
                </div>

                <div className="step-box">
                  <div className="step-box-title">Remaining Need (P{currentStep.process})</div>
                  <div className="step-box-value" style={{ color: 'var(--warning-amber)' }}>
                    [{currentStep.need.join(', ')}]
                  </div>
                </div>

                <div className="step-box">
                  <div className="step-box-title">Work After (+ Allocation)</div>
                  <div className="step-box-value" style={{ color: 'var(--safe-green)' }}>
                    [{currentStep.work_after.join(', ')}]
                  </div>
                </div>
              </div>

              <div className="step-note-alert">
                <strong>Viva Note: </strong> {currentStep.note}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calculated Need Matrix */}
      {safetyData.need && (
        <div className="matrix-card" style={{ marginTop: '1rem' }}>
          <div className="matrix-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                Computed Need Matrix (Need = Max - Allocation)
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Maximum additional resources each process may still request
              </p>
            </div>
            <span className="matrix-tag" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-amber)' }}>
              Need
            </span>
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
                {safetyData.need.map((row, i) => {
                  const isCurrentInStep = currentStep?.process === i;
                  return (
                    <tr
                      key={i}
                      style={{
                        backgroundColor: isCurrentInStep
                          ? 'rgba(99, 102, 241, 0.12)'
                          : undefined,
                      }}
                    >
                      <td className="proc-col">
                        <span
                          className="proc-badge"
                          style={{
                            background: isCurrentInStep
                              ? 'var(--accent-primary)'
                              : undefined,
                            color: isCurrentInStep ? '#ffffff' : undefined,
                          }}
                        >
                          P{i}
                        </span>
                      </td>
                      {row.map((val, j) => (
                        <td key={j} className="matrix-cell-static">
                          {val}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
