#!/usr/bin/env python
"""
Validation script for NovaSignal backend setup
"""
import sys
import subprocess
import importlib
import os

def check_import(module_name, description):
    """Check if a module can be imported"""
    try:
        importlib.import_module(module_name)
        print(f"[OK] {description}")
        return True
    except ImportError as e:
        print(f"[FAIL] {description}: {e}")
        return False

def run_command(cmd, description):
    """Run a command and check its success"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print(f"[OK] {description}")
            return True
        else:
            print(f"[FAIL] {description}: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print(f"[TIMEOUT] {description}: Timed out")
        return False
    except Exception as e:
        print(f"[FAIL] {description}: {e}")
        return False

def main():
    print("NovaSignal Backend Validation")
    print("=" * 40)
    
    success_count = 0
    total_checks = 0
    
    # Check core imports
    checks = [
        ("fastapi", "FastAPI framework"),
        ("pydantic", "Pydantic data validation"),
        ("uvicorn", "ASGI server"),
        ("pandas", "Data processing"),
        ("numpy", "Numerical computing"),
        ("main", "Main application module"),
        ("pytest", "Testing framework"),
    ]
    
    print("\nImport Checks:")
    for module, description in checks:
        total_checks += 1
        if check_import(module, description):
            success_count += 1
    
    # Check pytest functionality
    print("\nTest Framework Checks:")
    test_commands = [
        ("python -m pytest --version", "Pytest installation"),
        ("python -m pytest test_health.py test_basic_api.py --collect-only -q", "Test discovery"),
    ]
    
    for cmd, description in test_commands:
        total_checks += 1
        if run_command(cmd, description):
            success_count += 1
    
    # Check file structure
    print("\nFile Structure Checks:")
    required_files = [
        ("main.py", "Main application file"),
        ("requirements.txt", "Dependencies file"),
        ("requirements-test.txt", "Test dependencies"),
        ("pytest.ini", "Pytest configuration"),
        ("pyproject.toml", "Project configuration"),
        ("test_health.py", "Health tests"),
        ("test_basic_api.py", "API tests"),
        ("conftest.py", "Pytest configuration"),
    ]
    
    for filename, description in required_files:
        total_checks += 1
        if os.path.exists(filename):
            print(f"[OK] {description}")
            success_count += 1
        else:
            print(f"[FAIL] {description}: File not found")
    
    print("\n" + "=" * 40)
    print(f"Validation Results: {success_count}/{total_checks} checks passed")
    
    if success_count == total_checks:
        print("SUCCESS: All checks passed! Backend is ready for development.")
        return 0
    else:
        print(f"WARNING: {total_checks - success_count} issues found. Please review and fix.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)