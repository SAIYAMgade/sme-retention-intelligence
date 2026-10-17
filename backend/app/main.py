"""
Main FastAPI Application Entrypoint.
SME Retention Intelligence - Revenue Analytics Platform.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from backend.app.api.endpoints import router as api_router

app = FastAPI(
    title="SME Retention Intelligence API",
    description="Revenue Analytics Intelligence Platform - End-to-end customer risk, exposure quantification, and prioritization.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for local development and deployed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import time
from datetime import datetime, timezone
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class HeadMethodMiddleware(BaseHTTPMiddleware):
    """
    Middleware ensuring HEAD requests (commonly sent by monitoring services like UptimeRobot)
    are routed identically to GET requests, returning headers with an empty body as per RFC 7231.
    """
    async def dispatch(self, request: Request, call_next):
        if request.method == "HEAD":
            request.scope["method"] = "GET"
            response = await call_next(request)
            request.scope["method"] = "HEAD"
            return Response(
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.media_type
            )
        return await call_next(request)

app.add_middleware(HeadMethodMiddleware)

START_TIME = time.time()

# Mount API router
app.include_router(api_router)

@app.api_route("/health", methods=["GET", "HEAD"], tags=["System"])
def root_health():
    """
    Lightweight health endpoint designed for UptimeRobot and cloud keepalive probes.
    Keeps Render free tier services awake by answering with 200 OK, timestamp, and uptime.
    Supports both GET and HEAD methods.
    """
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime": round(time.time() - START_TIME, 2),
        "service": "sme-retention-intelligence"
    }

# Locate frontend dist directory (for unified full-stack deployments such as Render or Docker)
FRONTEND_DIST = os.environ.get(
    "FRONTEND_DIST",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
)
if not os.path.exists(FRONTEND_DIST) or not os.path.exists(os.path.join(FRONTEND_DIST, "index.html")):
    for candidate in [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../static")),
        os.path.abspath("frontend/dist"),
        os.path.abspath("backend/static"),
    ]:
        if os.path.exists(candidate) and os.path.exists(os.path.join(candidate, "index.html")):
            FRONTEND_DIST = candidate
            break

if os.path.exists(FRONTEND_DIST):
    # Mount assets directory for CSS, JS, images
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Serve index.html for root and any client-side SPA route not matching /api or /docs
    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"], include_in_schema=False)
    async def serve_spa(full_path: str):
        # Exclude API, docs, redoc, openapi.json, health
        if full_path.startswith(("api", "docs", "redoc", "openapi.json", "health")):
            return RedirectResponse(url=f"/{full_path}")
        
        # Check if the requested file exists in dist (e.g., favicon.ico, vite.svg)
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Default fallback to index.html for client-side routing (e.g. /, /overview, /customers)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return RedirectResponse(url="/docs")
else:
    @app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
    def root():
        return RedirectResponse(url="/docs")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=True)
