import React from 'react';
import { X, BookOpen, Check, AlertCircle } from 'lucide-react';

export default function VivaGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen size={22} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Banker's Algorithm & OS Viva Guide
            </h2>
          </div>
          <button
            className="btn btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section 1: Overview */}
        <div className="viva-section">
          <h3>1. What is Deadlock Avoidance?</h3>
          <p>
            Unlike <em>Deadlock Prevention</em> (which restricts how requests can be made by invalidating one of Coffman's 4 conditions), 
            <strong>Deadlock Avoidance</strong> dynamically examines resource-allocation state to ensure that a circular wait condition can never exist.
            The system stays strictly within <strong>Safe States</strong>.
          </p>
        </div>

        {/* Section 2: Data Structures */}
        <div className="viva-section">
          <h3>2. Core Data Structures (n processes, m resource types)</h3>
          <ul>
            <li><strong>Available[m]:</strong> Number of available instances of resource type Rj.</li>
            <li><strong>Max[n][m]:</strong> Maximum demand of each process Pi for resource Rj.</li>
            <li><strong>Allocation[n][m]:</strong> Currently allocated instances of Rj to Pi.</li>
            <li><strong>Need[n][m]:</strong> Remaining resource instances needed by Pi:
              <div className="viva-code-box">Need[i][j] = Max[i][j] - Allocation[i][j]</div>
            </li>
          </ul>
        </div>

        {/* Section 3: Safety Algorithm */}
        <div className="viva-section">
          <h3>3. Safety Algorithm (Finding Safe Sequence)</h3>
          <ul>
            <li><strong>Step 1:</strong> Work = Available[:], Finish = [False] * n.</li>
            <li><strong>Step 2:</strong> Find index <code>i</code> such that <code>Finish[i] == False</code> and <code>Need[i] &lt;= Work</code>. If no such <code>i</code> exists, jump to Step 4.</li>
            <li><strong>Step 3:</strong> Process Pi completes and releases resources:
              <div className="viva-code-box">Work = Work + Allocation[i]
Finish[i] = True
(Repeat Step 2)</div>
            </li>
            <li><strong>Step 4:</strong> If <code>Finish[i] == True</code> for all <code>i</code>, the system is in a <strong>SAFE state</strong>; otherwise, it is <strong>UNSAFE</strong>.</li>
          </ul>
        </div>

        {/* Section 4: Resource-Request Algorithm */}
        <div className="viva-section">
          <h3>4. Resource-Request Algorithm (Pi requests Request_i)</h3>
          <ul>
            <li><strong>Rule 1 (Max Claim Check):</strong> If <code>Request_i[j] &gt; Need_i[j]</code>, raise error (process exceeded maximum claim).</li>
            <li><strong>Rule 2 (Availability Check):</strong> If <code>Request_i[j] &gt; Available[j]</code>, process Pi must <strong>wait</strong> (resources not available).</li>
            <li><strong>Rule 3 (Pretend Allocation):</strong>
              <div className="viva-code-box">Available = Available - Request_i
Allocation[i] = Allocation[i] + Request_i
Need[i] = Need[i] - Request_i</div>
            </li>
            <li><strong>Rule 4 (Safety Test & Rollback):</strong> Run Safety Algorithm. If safe, grant resources. If unsafe, rollback to previous state and Pi must wait.</li>
          </ul>
        </div>

        {/* Section 5: Complexity & FAQs */}
        <div className="viva-section">
          <h3>5. Complexity & Viva FAQs</h3>
          <ul>
            <li><strong>Time Complexity of Safety Algorithm:</strong> <code>O(m * n^2)</code>, where n is processes and m is resources.</li>
            <li><strong>Is an Unsafe state definitely a Deadlock?</strong> No! An unsafe state is not necessarily a deadlock, but deadlock can only occur in an unsafe state. A safe state guarantees that deadlock will never occur.</li>
            <li><strong>Why called Banker's Algorithm?</strong> Developed by Edsger Dijkstra for banking systems where a bank will not allocate cash unless it can satisfy every customer's maximum withdrawal demand eventually.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
