"""Minimal regression script for the _to_dict helper in parser.py.

Run from the ``backend/`` directory:

    python scripts/test_to_dict.py

Exit code 0 → all assertions passed.
Exit code 1 → a regression was detected.
"""
from __future__ import annotations

import sys
import types
from pathlib import Path

# Ensure backend/ is on sys.path so ``import parser`` works.
sys.path.insert(0, str(Path(__file__).parent.parent))

# ---------------------------------------------------------------------------
# Allow the script to import parser without a full FastAPI / uvicorn install
# by mocking the casparser module before the import.
# ---------------------------------------------------------------------------
_mock_casparser = types.ModuleType("casparser")
_mock_casparser.read_cas_pdf = lambda *a, **kw: {}  # type: ignore[attr-defined]
sys.modules.setdefault("casparser", _mock_casparser)

from parser import _to_dict  # noqa: E402  (must come after the mock)


def _assert(condition: bool, message: str) -> None:
    if not condition:
        print(f"FAIL: {message}", file=sys.stderr)
        sys.exit(1)
    print(f"PASS: {message}")


# 1. Plain dict is returned as-is.
d = {"a": 1}
result = _to_dict(d)
_assert(result is d, "plain dict returned as-is")

# 2. Pydantic-v2-style object (has model_dump) is converted.
class _PydanticLike:
    def model_dump(self) -> dict:
        return {"key": "value"}

result = _to_dict(_PydanticLike())
_assert(result == {"key": "value"}, "model_dump() used for pydantic-like objects")

# 3. Generic object with __dict__ is converted.
class _Plain:
    def __init__(self) -> None:
        self.x = 42

result = _to_dict(_Plain())
_assert(result == {"x": 42}, "__dict__ used as fallback")

# 4. Unsupported type raises TypeError.
try:
    _to_dict(123)  # type: ignore[arg-type]
    _assert(False, "TypeError raised for unsupported type")  # should not reach
except TypeError:
    _assert(True, "TypeError raised for unsupported type")

print("\nAll regression checks passed.")
