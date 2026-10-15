"""
Unit and Integration Tests for Banker's Algorithm Backend
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.bankers import (
    run_safety_algorithm,
    handle_resource_request,
    calculate_need,
    get_textbook_sample,
)

client = TestClient(app)


def test_textbook_sample_safety():
    """
    Test 1: Classic textbook example (Silberschatz)
    Expect safe sequence: P1, P3, P4, P0, P2
    """
    sample = get_textbook_sample()
    is_safe, safe_seq, need, steps = run_safety_algorithm(
        sample["allocation"], sample["max"], sample["available"]
    )

    assert is_safe is True
    # Expected safe sequence indices: 1, 3, 4, 0, 2
    assert safe_seq == [1, 3, 4, 0, 2]
    assert len(steps) == 5

    # Check via REST API endpoint
    response = client.post("/api/safety-check", json={
        "allocation": sample["allocation"],
        "max": sample["max"],
        "available": sample["available"]
    })
    assert response.status_code == 200
    data = response.json()
    assert data["is_safe"] is True
    assert data["safe_sequence"] == [1, 3, 4, 0, 2]
    assert len(data["steps"]) == 5


def test_unsafe_state():
    """
    Test 2: An unsafe state where no process can satisfy its need with available resources.
    """
    allocation = [
        [2, 1],
        [1, 2]
    ]
    max_matrix = [
        [4, 3],
        [3, 4]
    ]
    # Need will be [[2, 2], [2, 2]]
    # Available is [1, 1] -> neither P0 nor P1 can run
    available = [1, 1]

    is_safe, safe_seq, need, steps = run_safety_algorithm(allocation, max_matrix, available)
    assert is_safe is False
    assert safe_seq == []

    # API check
    response = client.post("/api/safety-check", json={
        "allocation": allocation,
        "max": max_matrix,
        "available": available
    })
    assert response.status_code == 200
    data = response.json()
    assert data["is_safe"] is False
    assert data["safe_sequence"] == []


def test_granted_request():
    """
    Test 3: A valid resource request that leaves the system in a safe state.
    In the textbook example, P1 requests [1, 0, 2].
    This should be granted!
    """
    sample = get_textbook_sample()
    payload = {
        "allocation": sample["allocation"],
        "max": sample["max"],
        "available": sample["available"],
        "process_id": 1,
        "request": [1, 0, 2]
    }

    response = client.post("/api/resource-request", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["granted"] is True
    assert "Request granted" in data["reason"]
    assert data["new_state"] is not None
    # Available after allocation: [3-1, 3-0, 2-2] = [2, 3, 0]
    assert data["new_state"]["available"] == [2, 3, 0]
    assert len(data["safe_sequence"]) == 5


def test_denied_request_exceeds_need():
    """
    Test 4: A denied request where Request > Need (exceeds max claim).
    For P1, Need is [1, 2, 2]. If P1 requests [2, 0, 0], it exceeds resource 0 need (2 > 1).
    Should raise HTTP 400 Bad Request.
    """
    sample = get_textbook_sample()
    payload = {
        "allocation": sample["allocation"],
        "max": sample["max"],
        "available": sample["available"],
        "process_id": 1,
        "request": [2, 0, 0]
    }

    response = client.post("/api/resource-request", json=payload)
    assert response.status_code == 400
    assert "exceeded its maximum claim" in response.json()["detail"]


def test_request_must_wait_exceeds_available():
    """
    Test 5: A request that must wait because Request > Available.
    In textbook state, Available = [3, 3, 2].
    P0 has Need = [7, 4, 3].
    If P0 requests [0, 4, 0], Request <= Need, but Request[1] (4) > Available[1] (3).
    Process must wait!
    """
    sample = get_textbook_sample()
    payload = {
        "allocation": sample["allocation"],
        "max": sample["max"],
        "available": sample["available"],
        "process_id": 0,
        "request": [0, 4, 0]
    }

    response = client.post("/api/resource-request", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["granted"] is False
    assert "must wait because resources are not available yet" in data["reason"]
    assert data["new_state"] is None


def test_denied_request_causes_unsafe_state():
    """
    Test 6: Request is <= Need and <= Available, but granting it leads to an unsafe state.
    In textbook state, suppose P0 requests [0, 2, 0].
    Available becomes [3, 1, 2].
    Let's check if unsafe or if another request causes deadlock avoidance rollback.
    """
    sample = get_textbook_sample()
    # P4 requests [3, 3, 0]: Need is [4, 3, 1] (<= Need), Available is [3, 3, 2] (<= Available)
    # Available becomes [0, 0, 2].
    # Then can any process run?
    # P0 need [7,4,3], P1 need [1,2,2], P2 need [6,0,0], P3 need [0,1,1], P4 need [1,0,1]
    # In [0, 0, 2], need[3] is [0, 1, 1] > [0, 0, 2]. Need[4] is [1, 0, 1] > [0, 0, 2].
    # No process can run! Unsafe state!
    payload = {
        "allocation": sample["allocation"],
        "max": sample["max"],
        "available": sample["available"],
        "process_id": 4,
        "request": [3, 3, 0]
    }

    response = client.post("/api/resource-request", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["granted"] is False
    assert "UNSAFE" in data["reason"] or "rolled back" in data["reason"]


def test_validation_errors():
    """
    Test 7: Validation edge cases (Allocation > Max, negative values, dimension mismatch).
    """
    # Allocation > Max
    bad_payload = {
        "allocation": [[5, 2]],
        "max": [[3, 2]],
        "available": [1, 1]
    }
    res = client.post("/api/safety-check", json=bad_payload)
    assert res.status_code == 422

    # Negative value
    bad_negative = {
        "allocation": [[-1, 0]],
        "max": [[1, 0]],
        "available": [1, 1]
    }
    res2 = client.post("/api/safety-check", json=bad_negative)
    assert res2.status_code == 422
