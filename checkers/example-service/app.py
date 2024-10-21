import os
import json
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
        "-r", "--round-flag", help="Current round's flag, required if mode is push"
    )
    parser.add_argument(
        "-m",
        "--mode",
        help="Mode of the checker",
        required=True,
        choices=["push", "pull"],
    )
    parser.add_argument(
        "-d",
        "--metadata",
        help="Additional metadata for the checker, must be a JSON string",
        required=True,
    )
    args = parser.parse_args()
    if args.mode == "push" and args.round_flag is None:
        parser.error("Round flag is required in push mode")

    run_checker(
        mode=args.mode,
        target_ip=args.target_ip,
        round_flag=args.round_flag,
        metadata=json.loads(args.metadata),
    )
