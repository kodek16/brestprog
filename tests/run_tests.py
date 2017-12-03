#!/usr/bin/env python

"""Executes tests for source code listings.

Walks through /topics directory and executes all files named
test*.cc.
"""
from concurrent import futures
import os
import subprocess
import sys
import tempfile
import threading

NUM_THREADS = 4

# Used for syncronizing output to stderr.
stderr_lock = threading.Lock()

def main():
    test_filenames = []
    for root, dirs, filenames in os.walk('topics/'):
        test_filenames.extend(
            [os.path.join(root, filename) for filename in filenames
             if IsTestFile(filename)])

    successful_tests = 0
    total_tests = len(test_filenames)

    with futures.ThreadPoolExecutor(max_workers=NUM_THREADS) as executor:
        result_futures = {executor.submit(ExecuteTestCc, filename)
                          for filename in test_filenames}
        for result_future in futures.as_completed(result_futures):
            try:
                if result_future.result():
                    successful_tests += 1
            except Exception as e:
                with stderr_lock:
                    print('Testing failed with an exception: {}.'.format(e),
                          file=sys.stderr)

    if successful_tests == total_tests:
        print('SUCCESS: {0} of {0} tests passed!'.format(total_tests))
    else:
        print('FAILED: {} of {} tests passed!'.format(successful_tests, total_tests))


def ExecuteTestCc(filename):
    """Executes the test and return True if it was successful."""
    with tempfile.TemporaryDirectory() as temp_dir:
        executable_path = os.path.join(temp_dir, 'test.exe')

        compile_command = ['g++', '-std=c++17', '-O2',
                           '-Itests/include', '-o', executable_path, filename]
        compile_process = subprocess.run(
            compile_command, stderr=subprocess.PIPE)

        if compile_process.returncode != 0:
            with stderr_lock:
                print('Failed to compile {}.'.format(filename), file=sys.stderr)
                print(compile_process.stderr.decode('utf8'), file=sys.stderr)
            return False

        run_process = subprocess.run([executable_path], stderr=subprocess.PIPE)
        if run_process.returncode != 0:
            with stderr_lock:
                print('Test {} failed!'.format(filename), file=sys.stderr)
                print(run_process.stderr.decode('utf8'), file=sys.stderr)
            return False

        return True


def IsTestFile(filename):
    return filename.startswith('test') and filename.endswith('.cc')


if __name__ == '__main__':
    main()
