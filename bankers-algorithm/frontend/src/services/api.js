/**
 * API Service for Banker's Algorithm Backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred.';
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          errorDetail = errorData.detail.join(', ');
        } else {
          errorDetail = errorData.detail;
        }
      } else if (errorData.reason) {
        errorDetail = errorData.reason;
      }
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  /**
   * Fetches textbook classic sample data (5 processes, 3 resources)
   */
  async getSample() {
    const res = await fetch(`${API_BASE}/api/sample`);
    return handleResponse(res);
  },

  /**
   * Runs the safety check on given allocation, max, and available state
   */
  async checkSafety(allocation, max, available) {
    const res = await fetch(`${API_BASE}/api/safety-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ allocation, max, available }),
    });
    return handleResponse(res);
  },

  /**
   * Submits a resource request for a specific process
   */
  async requestResource(allocation, max, available, processId, request) {
    const res = await fetch(`${API_BASE}/api/resource-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        allocation,
        max,
        available,
        process_id: Number(processId),
        request: request.map(Number),
      }),
    });
    return handleResponse(res);
  },
};
