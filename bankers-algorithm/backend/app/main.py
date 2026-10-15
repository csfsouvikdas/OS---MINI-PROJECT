"""
FastAPI application for Banker's Algorithm Tool
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.models import (
    SafetyCheckRequest,
    SafetyCheckResponse,
    ResourceRequest,
    ResourceRequestResponse,
    SampleDataResponse,
)
from app.bankers import (
    run_safety_algorithm,
    handle_resource_request,
    get_textbook_sample,
)

app = FastAPI(
    title="Banker's Algorithm REST API",
    description="Deadlock Avoidance and Safe Sequence Calculation Tool for Operating Systems",
    version="1.0.0",
)

# Enable CORS for frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (e.g. Vite dev server on :5173, etc.)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    """
    Format Pydantic validation errors clearly for API consumers.
    """
    errors = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        msg = err.get("msg", "Validation error")
        errors.append(f"{loc}: {msg}" if loc else msg)

    return JSONResponse(
        status_code=422,
        content={"detail": errors[0] if len(errors) == 1 else errors},
    )


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "bankers-algorithm-backend"}


@app.get("/api/sample", response_model=SampleDataResponse)
def get_sample():
    """
    Returns the classic textbook example:
    5 processes, 3 resource types, Available = [3, 3, 2].
    """
    return get_textbook_sample()


@app.post("/api/safety-check", response_model=SafetyCheckResponse)
def check_safety(payload: SafetyCheckRequest):
    """
    Executes the Banker's Safety algorithm and returns:
    - Need matrix
    - is_safe (boolean)
    - safe_sequence (ordered list of process indices)
    - steps trace for visualization and viva explanation
    """
    is_safe, safe_sequence, need, steps = run_safety_algorithm(
        allocation=payload.allocation,
        max_matrix=payload.max,
        available=payload.available,
    )
    return SafetyCheckResponse(
        need=need,
        is_safe=is_safe,
        safe_sequence=safe_sequence,
        steps=steps,
    )


@app.post("/api/resource-request", response_model=ResourceRequestResponse)
def request_resources(payload: ResourceRequest):
    """
    Handles dynamic resource request for a given process:
    - Error (400) if Request > Need (process exceeded max claim)
    - Wait if Request > Available
    - Pretend allocate, verify safety, and rollback if unsafe
    """
    result = handle_resource_request(
        allocation=payload.allocation,
        max_matrix=payload.max,
        available=payload.available,
        process_id=payload.process_id,
        request=payload.request,
    )

    # If the process exceeded its maximum claim, return HTTP 400 as per specification
    if result.get("status_code") == 400:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["reason"],
        )

    return ResourceRequestResponse(
        granted=result["granted"],
        reason=result["reason"],
        new_state=result.get("new_state"),
        safe_sequence=result.get("safe_sequence", []),
        steps=result.get("steps"),
    )
