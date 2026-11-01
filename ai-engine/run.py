"""
EstateIQ AI Engine — Convenience Launcher

Usage:
    cd ai-engine
    python run.py
"""
import sys
from pathlib import Path
import uvicorn

AI_ENGINE_DIR = Path(__file__).resolve().parent
if str(AI_ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_ENGINE_DIR))

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
        reload_dirs=[str(AI_ENGINE_DIR / "app")]
    )
