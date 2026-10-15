import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MatrixEditor from './components/MatrixEditor';
import SafetyResults from './components/SafetyResults';
import ResourceRequestPanel from './components/ResourceRequestPanel';
import VivaGuideModal from './components/VivaGuideModal';
import { api } from './services/api';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  // Theme management
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('bankers_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bankers_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State for matrices
  const [numProcesses, setNumProcesses] = useState(5);
  const [numResources, setNumResources] = useState(3);
  const [allocation, setAllocation] = useState([
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ]);
  const [maxMatrix, setMaxMatrix] = useState([
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ]);
  const [available, setAvailable] = useState([3, 3, 2]);

  // Results & UI State
  const [safetyData, setSafetyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);

  // Load sample on mount
  const handleLoadSample = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getSample();
      setNumProcesses(data.allocation.length);
      setNumResources(data.available.length);
      setAllocation(data.allocation);
      setMaxMatrix(data.max);
      setAvailable(data.available);

      // Automatically evaluate safety for the sample data
      const safety = await api.checkSafety(data.allocation, data.max, data.available);
      setSafetyData(safety);
    } catch (err) {
      setErrorMessage(
        `Failed to fetch sample: ${err.message}. Make sure the FastAPI backend is running.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleLoadSample();
  }, []);

  // Safety Check
  const handleCheckSafety = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.checkSafety(allocation, maxMatrix, available);
      setSafetyData(data);
    } catch (err) {
      setErrorMessage(err.message || 'Error executing safety check.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resource Request
  const handleRequestResource = async (processId, request) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await api.requestResource(
        allocation,
        maxMatrix,
        available,
        processId,
        request
      );
      return result;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Apply new state from granted request
  const handleApplyNewState = (newState) => {
    if (newState) {
      setAllocation(newState.allocation);
      setMaxMatrix(newState.max);
      setAvailable(newState.available);
      handleCheckSafety();
    }
  };

  return (
    <div className="app-container">
      {/* Navbar with brand & theme toggle */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenVivaGuide={() => setIsVivaModalOpen(true)}
      />

      {/* Global Error Banner */}
      {errorMessage && (
        <div
          style={{
            background: 'var(--unsafe-red-light)',
            border: '1px solid var(--unsafe-red-border)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--unsafe-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
          <button
            className="btn btn-icon"
            onClick={() => setErrorMessage(null)}
            style={{ padding: '0.35rem' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Primary Matrix Editor */}
      <MatrixEditor
        numProcesses={numProcesses}
        numResources={numResources}
        setNumProcesses={setNumProcesses}
        setNumResources={setNumResources}
        allocation={allocation}
        setAllocation={setAllocation}
        maxMatrix={maxMatrix}
        setMaxMatrix={setMaxMatrix}
        available={available}
        setAvailable={setAvailable}
        onLoadSample={handleLoadSample}
        onCheckSafety={handleCheckSafety}
        isLoading={isLoading}
      />

      {/* Safety Analysis & Stepper Trace */}
      <SafetyResults
        safetyData={safetyData}
        numProcesses={numProcesses}
        numResources={numResources}
      />

      {/* Dynamic Resource Request Panel */}
      <ResourceRequestPanel
        numProcesses={numProcesses}
        numResources={numResources}
        allocation={allocation}
        maxMatrix={maxMatrix}
        available={available}
        onRequestResource={handleRequestResource}
        onApplyNewState={handleApplyNewState}
        isLoading={isLoading}
      />

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '1.5rem 0',
          color: 'var(--text-muted)',
          fontSize: '0.825rem',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: '1rem',
        }}
      >
        <p>
          OS Mini Project: Banker's Algorithm (Deadlock Avoidance) Simulator
        </p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.78rem' }}>
          Backend: FastAPI (Python) &nbsp;|&nbsp; Frontend: React + Vite &nbsp;|&nbsp; REST API Communication
        </p>
      </footer>

      {/* Viva / Theory Modal */}
      <VivaGuideModal
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
      />
    </div>
  );
}
