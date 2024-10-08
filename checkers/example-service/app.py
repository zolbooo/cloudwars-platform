import os
import argparse

from checker import run_checker

if __name__ == "__main__":
    if os.getenv("CHECKER_SERVICE_NAME") is None:
        raise ValueError("CHECKER_SERVICE_NAME environment variable is not set")
    if os.getenv("GAME_COORDINATOR_URL") is None:
        raise ValueError("GAME_COORDINATOR_URL environment variable is not set")

    parser = argparse.ArgumentParser(description="Example service checker")
    parser.add_argument(
        "-t", "--target-ip", help="IP address of the target instance", required=True
    )
    parser.add_argument(
        "-r", "--round-flag", help="Current round's flag", required=True
    )
    args = parser.parse_args()

    run_checker(args.target_ip, args.round_flag)
