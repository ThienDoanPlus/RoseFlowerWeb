#!/usr/bin/env python
import os
import sys
import unittest

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# pyrefly: ignore [missing-import]
import django
django.setup()

def run_tests():
    print("================================================================")
    print("  Rose Flowers - DJANGO REST FRAMEWORK TEST SUITE")
    print("================================================================\n")
    loader = unittest.TestLoader()
    suite = loader.discover('tests', pattern='test_*.py')
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    if result.wasSuccessful():
        print("\n 100% CÁC BÀI KIỂM THỬ BACKEND (DRF & RBAC) ĐỀU THÀNH CÔNG!\n")
        return 0
    return 1

if __name__ == '__main__':
    sys.exit(run_tests())
