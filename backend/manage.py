#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import xmlrunner

def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "korp_portal.settings")
    try:
        from django.core.management import execute_from_command_line
        from django.core.management.commands.test import Command as TestCommand
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # Override test command to use xmlrunner
    if 'test' in sys.argv:
        # Create results directory if it doesn't exist
        results_dir = '/app/results'
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)

        # Set test runner to use xmlrunner and output results to the directory
        TestCommand.test_runner = lambda verbosity, interactive, failfast, keepdb=False, **kwargs: \
            xmlrunner.XMLTestRunner(output=results_dir)

    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
