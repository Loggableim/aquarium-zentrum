#!/usr/bin/env python3
"""Compatibility entry point; share the portable sitemap logic with the build."""
from pathlib import Path
import subprocess

if __name__ == "__main__":
    subprocess.run(["node", str(Path(__file__).resolve().with_name("generate-sitemap.js"))], check=True)
