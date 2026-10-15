"""
Pydantic Models and Request/Response Validation for Banker's Algorithm API
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, model_validator


class SafetyCheckRequest(BaseModel):
    allocation: List[List[int]] = Field(..., description="Allocation matrix of size n x m")
    max: List[List[int]] = Field(..., description="Max matrix of size n x m")
    available: List[int] = Field(..., description="Available vector of length m")

    @model_validator(mode="after")
    def validate_matrices(self):
        alloc = self.allocation
        max_m = self.max
        avail = self.available

        if not alloc or len(alloc) == 0:
            raise ValueError("Allocation matrix must have at least one process (row).")
        if not max_m or len(max_m) == 0:
            raise ValueError("Max matrix must have at least one process (row).")
        if not avail or len(avail) == 0:
            raise ValueError("Available vector must have at least one resource type.")

        num_processes = len(alloc)
        num_resources = len(avail)

        if len(max_m) != num_processes:
            raise ValueError(
                f"Dimension mismatch: Allocation has {num_processes} processes, but Max has {len(max_m)} processes."
            )

        for j, a in enumerate(avail):
            if a < 0:
                raise ValueError(f"Available resource at index {j} cannot be negative (got {a}).")

        for i in range(num_processes):
            row_alloc = alloc[i]
            row_max = max_m[i]

            if len(row_alloc) != num_resources:
                raise ValueError(
                    f"Process P{i} allocation row length ({len(row_alloc)}) does not match resource count ({num_resources})."
                )
            if len(row_max) != num_resources:
                raise ValueError(
                    f"Process P{i} max row length ({len(row_max)}) does not match resource count ({num_resources})."
                )

            for j in range(num_resources):
                val_alloc = row_alloc[j]
                val_max = row_max[j]

                if val_alloc < 0:
                    raise ValueError(f"Allocation for P{i}, resource {j} cannot be negative (got {val_alloc}).")
                if val_max < 0:
                    raise ValueError(f"Max demand for P{i}, resource {j} cannot be negative (got {val_max}).")
                if val_alloc > val_max:
                    raise ValueError(
                        f"Invalid state: Allocation ({val_alloc}) exceeds Max claim ({val_max}) "
                        f"for Process P{i}, Resource {j}."
                    )

        return self


class StepTrace(BaseModel):
    step: int
    process: int
    work_before: List[int]
    need: List[int]
    work_after: List[int]
    note: str


class SafetyCheckResponse(BaseModel):
    need: List[List[int]]
    is_safe: bool
    safe_sequence: List[int]
    steps: List[StepTrace]


class ResourceRequest(BaseModel):
    allocation: List[List[int]] = Field(..., description="Allocation matrix")
    max: List[List[int]] = Field(..., description="Max matrix")
    available: List[int] = Field(..., description="Available vector")
    process_id: int = Field(..., description="Index of requesting process (0-indexed)")
    request: List[int] = Field(..., description="Resource request vector")

    @model_validator(mode="after")
    def validate_request_payload(self):
        alloc = self.allocation
        max_m = self.max
        avail = self.available
        pid = self.process_id
        req = self.request

        # Re-use matrix validation
        if not alloc or len(alloc) == 0:
            raise ValueError("Allocation matrix must have at least one process.")
        if not max_m or len(max_m) == 0:
            raise ValueError("Max matrix must have at least one process.")
        if not avail or len(avail) == 0:
            raise ValueError("Available vector must have at least one resource.")

        num_processes = len(alloc)
        num_resources = len(avail)

        if len(max_m) != num_processes:
            raise ValueError(f"Allocation processes ({num_processes}) != Max processes ({len(max_m)}).")

        for j, a in enumerate(avail):
            if a < 0:
                raise ValueError(f"Available resource at index {j} cannot be negative.")

        for i in range(num_processes):
            if len(alloc[i]) != num_resources or len(max_m[i]) != num_resources:
                raise ValueError(f"Process P{i} matrix row length must match resource count {num_resources}.")
            for j in range(num_resources):
                if alloc[i][j] < 0 or max_m[i][j] < 0:
                    raise ValueError("Values in Allocation and Max matrices cannot be negative.")
                if alloc[i][j] > max_m[i][j]:
                    raise ValueError(f"Allocation exceeds Max for P{i}, resource {j}.")

        if pid < 0 or pid >= num_processes:
            raise ValueError(f"process_id P{pid} is out of bounds. Valid range: 0 to {num_processes - 1}.")

        if len(req) != num_resources:
            raise ValueError(f"Request vector length ({len(req)}) must match resource count ({num_resources}).")

        for j, r in enumerate(req):
            if r < 0:
                raise ValueError(f"Requested amount at resource index {j} cannot be negative (got {r}).")

        return self


class ResourceRequestResponse(BaseModel):
    granted: bool
    reason: str
    new_state: Optional[Dict[str, Any]] = None
    safe_sequence: List[int] = Field(default_factory=list)
    steps: Optional[List[StepTrace]] = None


class SampleDataResponse(BaseModel):
    process_names: List[str]
    resource_names: List[str]
    allocation: List[List[int]]
    max: List[List[int]]
    available: List[int]
