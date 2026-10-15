# OS---MINI-PROJECT

## 🛡️ Banker's Algorithm Tool (Deadlock Avoidance Simulator)

An interactive, full-stack Operating Systems mini-project implementing **Edsger Dijkstra's Banker's Algorithm** for Deadlock Avoidance and Resource Allocation analysis.

Built with a decoupled architecture where the **Python FastAPI backend** and **React + Vite frontend** communicate strictly over a REST API.

---

## 📑 Table of Contents
- [Architecture & Project Structure](#-architecture--project-structure)
- [Key Features](#-key-features)
- [Prerequisites](#-prerequisites)
- [Backend Setup & Run](#-backend-setup--run-fastapi)
- [Frontend Setup & Run](#-frontend-setup--run-react--vite)
- [Running Unit Tests](#-running-unit-tests)
- [REST API Documentation](#-rest-api-documentation)
- [Operating Systems Viva & Theory Guide](#-operating-systems-viva--theory-guide)

---

## 🏛️ Architecture & Project Structure

```text
OS PROJECT / bankers-algorithm/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── bankers.py       # Core Banker's safety & request algorithms
│   │   ├── models.py        # Pydantic schemas & strict matrix validation
│   │   └── main.py          # FastAPI application & REST endpoints
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_bankers.py  # Pytest test suite (textbook, unsafe, requests)
│   ├── requirements.txt     # Python dependencies (FastAPI, uvicorn, pytest)
│   └── venv/                # Python virtual environment (gitignored)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Brand header & theme toggle
│   │   │   ├── MatrixEditor.jsx         # Editable Allocation, Max & Available tables
│   │   │   ├── SafetyResults.jsx        # Safe/Unsafe badge, safe chain & step trace
│   │   │   ├── ResourceRequestPanel.jsx # Dynamic request simulator
│   │   │   └── VivaGuideModal.jsx       # Built-in theory & viva reference modal
│   │   ├── services/
│   │   │   └── api.js                   # REST API client
│   │   ├── App.jsx                      # Main app controller
│   │   ├── index.css                    # Modern Vanilla CSS design system
│   │   └── main.jsx
│   ├── .env                             # Frontend environment configuration
│   ├── .env.example                     # Environment template
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## ✨ Key Features

1. **Interactive Matrix Editor**:
   - Dynamic process ($n$) and resource ($m$) counters (from 1 to 10).
   - Synchronized editable tables for **Allocation Matrix**, **Max Demand Matrix**, and **Available Vector**.
   - Real-time client-side validation: instantly highlights cells where $\text{Allocation} > \text{Max}$ or values are negative.
   - Shows Total System Resources ($\sum \text{Allocation} + \text{Available}$).

2. **One-Click Textbook Sample**:
   - Loads the classic Silberschatz & Galvin 5-process, 3-resource problem with expected safe sequence: `P1 -> P3 -> P4 -> P0 -> P2`.

3. **Safety Analysis & Safe Sequence**:
   - Dynamically calculates the **Need Matrix** ($\text{Need} = \text{Max} - \text{Allocation}$).
   - Clear **SAFE** / **UNSAFE** status badge.
   - Colored visual chip chain showing the safe process execution order.

4. **Step-by-Step Trace Viewer**:
   - Interactive stepper with **Previous**, **Next**, and **Auto-Play** controls.
   - Shows step-by-step vector transformations: $\text{Work Before} \to \text{Need Check} \to \text{Work After} = \text{Work} + \text{Allocation}$.
   - Includes contextual explanation notes for each step (great for viva presentation!).

5. **Dynamic Resource-Request Algorithm**:
   - Simulates active process requesting additional resource units.
   - Enforces Banker's request rules:
     - **Rule 1**: $\text{Request} \le \text{Need}$ (raises error if exceeded).
     - **Rule 2**: $\text{Request} \le \text{Available}$ (process must wait if unavailable).
     - **Rule 3 & 4**: Pretend allocation $\to$ Safety check $\to$ Grant or Rollback if unsafe.
   - **Apply to Workspace** button to advance system state immediately upon granting.

6. **Design & UX**:
   - Glassmorphic UI with curated palette.
   - Full **Dark / Light Mode** toggle (persisted in `localStorage`).
   - Built-in **OS Viva & Theory Guide Modal**.

---

## 📦 Prerequisites

- **Python**: Version 3.10 or higher
- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher

---

## 🚀 Backend Setup & Run (FastAPI)

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd bankers-algorithm/backend
   ```

2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```cmd
     venv\Scripts\activate
     ```

4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

The backend API will be running at `http://127.0.0.1:8000`.  
Interactive Swagger API documentation is available at `http://127.0.0.1:8000/docs`.

---

## 🎨 Frontend Setup & Run (React + Vite)

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd bankers-algorithm/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure the environment file `.env` is configured (defaults to port 8000):
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. Launch the Vite development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```text
   http://127.0.0.1:5173/
   ```

---

## 🧪 Running Unit Tests

The backend includes a comprehensive `pytest` test suite covering:
1. Classic textbook sample verification (`P1 -> P3 -> P4 -> P0 -> P2`).
2. Unsafe state detection (no process can execute).
3. Granted resource request.
4. Denied resource request when exceeding Need ($\text{Request} > \text{Need}$, HTTP 400).
5. Request that must wait when exceeding Available ($\text{Request} > \text{Available}$).
6. Request leading to unsafe state and automatic rollback.
7. Matrix validation and error handling (negative values, dimension mismatches, $\text{Allocation} > \text{Max}$).

To run tests:
```bash
cd bankers-algorithm/backend
venv/bin/python -m pytest tests/test_bankers.py -v
```

---

## 🔌 REST API Documentation

### 1. `GET /api/sample`
Returns the classic textbook initial state.
- **Response `200 OK`**:
  ```json
  {
    "process_names": ["P0", "P1", "P2", "P3", "P4"],
    "resource_names": ["A", "B", "C"],
    "allocation": [
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
      [2, 1, 1],
      [0, 0, 2]
    ],
    "max": [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
      [4, 3, 3]
    ],
    "available": [3, 3, 2]
  }
  ```

### 2. `POST /api/safety-check`
Runs the Banker's safety algorithm and returns the step-by-step trace and safe sequence.
- **Request Body**:
  ```json
  {
    "allocation": [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]],
    "max": [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]],
    "available": [3, 3, 2]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "need": [[7, 4, 3], [1, 2, 2], [6, 0, 0], [0, 1, 1], [4, 3, 1]],
    "is_safe": true,
    "safe_sequence": [1, 3, 4, 0, 2],
    "steps": [
      {
        "step": 1,
        "process": 1,
        "work_before": [3, 3, 2],
        "need": [1, 2, 2],
        "work_after": [5, 3, 2],
        "note": "P1 can execute since Need [1, 2, 2] <= Work [3, 3, 2]..."
      }
    ]
  }
  ```

### 3. `POST /api/resource-request`
Handles a dynamic resource request for a specified process.
- **Request Body**:
  ```json
  {
    "allocation": [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]],
    "max": [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]],
    "available": [3, 3, 2],
    "process_id": 1,
    "request": [1, 0, 2]
  }
  ```
- **Response `200 OK` (Granted)**:
  ```json
  {
    "granted": true,
    "reason": "Request granted! Allocating [1, 0, 2] to P1 leaves the system in a safe state...",
    "new_state": {
      "allocation": [[0, 1, 0], [3, 0, 2], [3, 0, 2], [2, 1, 1], [0, 0, 2]],
      "max": [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]],
      "available": [2, 3, 0],
      "need": [[7, 4, 3], [0, 2, 0], [6, 0, 0], [0, 1, 1], [4, 3, 1]]
    },
    "safe_sequence": [1, 3, 4, 0, 2]
  }
  ```

---

## 🎓 Operating Systems Viva & Theory Guide

### 1. What is Deadlock Avoidance?
Deadlock Avoidance requires the operating system to be given advance information concerning which resources a process will request and use during its lifetime. With this knowledge, the OS dynamically decides for every request whether granting it keeps the system in a **Safe State**.

### 2. What is a Safe State?
A state is safe if the system can allocate resources to each process (up to its maximum demand) in some order and still avoid a deadlock. More formally, a system is in a safe state only if there exists a **Safe Sequence** $\langle P_0, P_1, \dots, P_{n-1} \rangle$.

### 3. Core Data Structures:
- $n$: number of processes, $m$: number of resource types.
- **Available[$m$]**: Vector of length $m$. If $\text{Available}[j] = k$, $k$ instances of resource $R_j$ are free.
- **Max[$n \times m$]**: If $\text{Max}[i][j] = k$, process $P_i$ may request at most $k$ instances of $R_j$.
- **Allocation[$n \times m$]**: If $\text{Allocation}[i][j] = k$, process $P_i$ is currently allocated $k$ instances of $R_j$.
- **Need[$n \times m$]**: Remaining resource need of process $P_i$:
  $$\text{Need}[i][j] = \text{Max}[i][j] - \text{Allocation}[i][j]$$

### 4. Safety Algorithm Complexity:
- Time Complexity: $\mathcal{O}(m \times n^2)$ operations.
- Space Complexity: $\mathcal{O}(n \times m)$ storage for matrices.

---

## 👨‍💻 Author
- **Souvik Das** ([@csfsouvikdas](https://github.com/csfsouvikdas))
- Project: Operating Systems Mini Project
