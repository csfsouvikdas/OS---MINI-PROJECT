"""
Banker's Algorithm Core Module
-------------------------------
Deadlock Avoidance algorithm developed by Edsger Dijkstra.
Models resource allocation to ensure the system never enters an unsafe state.

Data Structures:
- n: Number of processes
- m: Number of resource types
- Available: 1D array of length m (available instances of each resource)
- Max: 2D array of size n x m (maximum demand of each process)
- Allocation: 2D array of size n x m (resources currently allocated to each process)
- Need: 2D array of size n x m (remaining resources needed by each process: Need = Max - Allocation)
- Work: 1D array of length m (working vector tracking currently available resources)
- Finish: 1D boolean array of length n (Finish[i] == True if process i has finished)
"""

from typing import List, Dict, Any, Tuple, Optional


def calculate_need(allocation: List[List[int]], max_matrix: List[List[int]]) -> List[List[int]]:
    """
    Calculates the Need matrix where Need[i][j] = Max[i][j] - Allocation[i][j].
    """
    n = len(allocation)
    m = len(allocation[0]) if n > 0 else 0
    return [[max_matrix[i][j] - allocation[i][j] for j in range(m)] for i in range(n)]


def run_safety_algorithm(
    allocation: List[List[int]],
    max_matrix: List[List[int]],
    available: List[int]
) -> Tuple[bool, List[int], List[List[int]], List[Dict[str, Any]]]:
    """
    Executes the Banker's Safety Algorithm.

    Steps (Viva explanation):
    1. Initialize Work = Available[:] and Finish = [False] * n.
    2. Find an index i such that:
       a) Finish[i] == False
       b) Need[i] <= Work (i.e. Need[i][j] <= Work[j] for all j = 0..m-1)
       If no such i exists, jump to step 4.
    3. Process i can execute and release its allocated resources:
       Work = Work + Allocation[i]
       Finish[i] = True
       Record step details for visualization.
       Go back to step 2.
    4. If Finish[i] == True for all i, the system is in a SAFE state.
       Otherwise, the system is in an UNSAFE state (potential deadlock).

    Returns:
        (is_safe, safe_sequence, need_matrix, steps)
    """
    n = len(allocation)
    m = len(available)
    need = calculate_need(allocation, max_matrix)

    # Step 1: Initialize Work and Finish vectors
    work = list(available)
    finish = [False] * n
    safe_sequence: List[int] = []
    steps: List[Dict[str, Any]] = []

    step_counter = 1
    current_index = 0

    # Step 2 & 3: Circularly sweep processes in order until all finish or no progress
    while len(safe_sequence) < n:
        found = False
        for offset in range(n):
            i = (current_index + offset) % n
            if not finish[i]:
                # Check if Need[i] <= Work for all resource types
                can_allocate = all(need[i][j] <= work[j] for j in range(m))

                if can_allocate:
                    work_before = list(work)
                    # Process completes and frees all its allocated resources
                    for j in range(m):
                        work[j] += allocation[i][j]

                    finish[i] = True
                    safe_sequence.append(i)
                    found = True
                    current_index = (i + 1) % n

                    steps.append({
                        "step": step_counter,
                        "process": i,
                        "work_before": work_before,
                        "need": list(need[i]),
                        "work_after": list(work),
                        "note": (
                            f"P{i} can execute since Need {need[i]} <= Work {work_before}. "
                            f"Upon completion, P{i} releases Allocation {allocation[i]}, "
                            f"updating Work to {work}."
                        )
                    })
                    step_counter += 1
                    break

        if not found:
            # No process could be satisfied with current Work vector
            break

    is_safe = all(finish)
    if not is_safe:
        # If unsafe, safe_sequence is empty as no complete sequence exists
        return False, [], need, steps

    return True, safe_sequence, need, steps


def handle_resource_request(
    allocation: List[List[int]],
    max_matrix: List[List[int]],
    available: List[int],
    process_id: int,
    request: List[int]
) -> Dict[str, Any]:
    """
    Handles a dynamic resource request from a process.

    Steps (Viva explanation):
    1. Check if Request[j] <= Need[process_id][j] for all j:
       If false, raise error (process exceeded maximum claim).
    2. Check if Request[j] <= Available[j] for all j:
       If false, process must wait (insufficient available resources right now).
    3. Pretend to allocate resources:
       Available = Available - Request
       Allocation[process_id] = Allocation[process_id] + Request
       Need[process_id] = Need[process_id] - Request
    4. Run Safety Algorithm on modified state:
       - If Safe: Grant the request permanently. Return new state and safe sequence.
       - If Unsafe: Rollback the allocation and make the process wait. Return explanation.
    """
    n = len(allocation)
    m = len(available)

    if process_id < 0 or process_id >= n:
        return {
            "granted": False,
            "status_code": 400,
            "reason": f"Invalid process_id: P{process_id}. Process ID must be between 0 and {n - 1}.",
            "new_state": None,
            "safe_sequence": []
        }

    need = calculate_need(allocation, max_matrix)

    # Condition 1: Request <= Need
    for j in range(m):
        if request[j] > need[process_id][j]:
            return {
                "granted": False,
                "status_code": 400,
                "reason": (
                    f"Error: Process P{process_id} has exceeded its maximum claim. "
                    f"Requested {request} but remaining Need is {need[process_id]} "
                    f"(Resource {j}: requested {request[j]} > needed {need[process_id][j]})."
                ),
                "new_state": None,
                "safe_sequence": []
            }

    # Condition 2: Request <= Available
    for j in range(m):
        if request[j] > available[j]:
            return {
                "granted": False,
                "status_code": 200,  # Valid business logic: process must wait
                "reason": (
                    f"Wait: Process P{process_id} must wait because resources are not available yet. "
                    f"Requested {request} but Available is {available} "
                    f"(Resource {j}: requested {request[j]} > available {available[j]})."
                ),
                "new_state": None,
                "safe_sequence": []
            }

    # Step 3: Pretend allocation
    temp_available = [available[j] - request[j] for j in range(m)]
    temp_allocation = [list(row) for row in allocation]
    for j in range(m):
        temp_allocation[process_id][j] += request[j]

    # Step 4: Run safety check on simulated state
    is_safe, safe_seq, temp_need, steps = run_safety_algorithm(
        temp_allocation, max_matrix, temp_available
    )

    if is_safe:
        return {
            "granted": True,
            "status_code": 200,
            "reason": (
                f"Request granted! Allocating {request} to P{process_id} leaves the system in a safe state. "
                f"Safe execution sequence: {' -> '.join(f'P{p}' for p in safe_seq)}."
            ),
            "new_state": {
                "allocation": temp_allocation,
                "max": max_matrix,
                "available": temp_available,
                "need": temp_need
            },
            "safe_sequence": safe_seq,
            "steps": steps
        }
    else:
        # Rollback
        return {
            "granted": False,
            "status_code": 200,
            "reason": (
                f"Request denied (rolled back): Allocating {request} to P{process_id} "
                f"would lead to an UNSAFE state with risk of deadlock. "
                f"Process P{process_id} must wait until more resources become available."
            ),
            "new_state": None,
            "safe_sequence": [],
            "steps": steps
        }


def get_textbook_sample() -> Dict[str, Any]:
    """
    Returns the classic Silberschatz & Galvin OS textbook example:
    5 Processes (P0..P4) and 3 Resource types (A, B, C).
    Available = [3, 3, 2]
    Expected safe sequence: P1, P3, P4, P0, P2
    """
    return {
        "process_names": ["P0", "P1", "P2", "P3", "P4"],
        "resource_names": ["A", "B", "C"],
        "allocation": [
            [0, 1, 0],  # P0
            [2, 0, 0],  # P1
            [3, 0, 2],  # P2
            [2, 1, 1],  # P3
            [0, 0, 2],  # P4
        ],
        "max": [
            [7, 5, 3],  # P0
            [3, 2, 2],  # P1
            [9, 0, 2],  # P2
            [2, 2, 2],  # P3
            [4, 3, 3],  # P4
        ],
        "available": [3, 3, 2]
    }
