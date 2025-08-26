#!/usr/bin/env python
"""
Test runner script for NovaSignal backend

This script provides a convenient way to run tests with different configurations.
"""
import subprocess
import sys
import os

def run_tests(args=None):
    """Run pytest with proper configuration"""
    if args is None:
        args = []
    
    # Base pytest command
    cmd = [sys.executable, "-m", "pytest"] + args
    
    # Add default args if none provided
    if not args:
        cmd.extend([
            "test_health.py",
            "test_basic_api.py", 
            "-v",
            "--tb=short"
        ])
    
    print(f"Running: {' '.join(cmd)}")
    return subprocess.call(cmd)

def run_with_coverage():
    """Run tests with coverage reporting"""
    return run_tests([
        "test_health.py",
        "test_basic_api.py",
        "--cov=.",
        "--cov-report=term-missing",
        "--cov-report=html:htmlcov",
        "-v"
    ])

def run_all():
    """Run all available tests"""
    return run_tests([
        "-v",
        "--tb=short"
    ])

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "coverage":
            exit_code = run_with_coverage()
        elif sys.argv[1] == "all":
            exit_code = run_all()
        else:
            # Pass through arguments
            exit_code = run_tests(sys.argv[1:])
    else:
        exit_code = run_tests()
    
    sys.exit(exit_code)