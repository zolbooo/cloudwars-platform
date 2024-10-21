import os
import json
import argparse

from dispatcher import dispatch_checkers

if __name__ == "__main__":
    project_id = os.getenv("GCP_PROJECT_ID")
    if project_id is None:
        raise ValueError("GCP_PROJECT_ID environment variable is not set")
    region = os.getenv("GCP_REGION")
    if region is None:
        raise ValueError("GCP_REGION environment variable is not set")

    parser = argparse.ArgumentParser(description="Cloudwars checker dispatcher")
    parser.add_argument("-r", "--current-round", required=True, help="Current round")
    parser.add_argument("-t", "--total-teams", required=True, help="Total teams count")
    parser.add_argument(
        "-c",
        "--checker-mode",
        required=True,
        help="Checker mode",
        choices=["push", "pull"],
    )
    parser.add_argument(
        "-m",
        "--metadata",
        required=True,
        help="Metadata for the checker, must be JSON string (will be passed back to the game coordinator)",
    )
    args = parser.parse_args()
    current_round = int(args.current_round)
    total_teams = int(args.total_teams)
    checker_mode = args.checker_mode
    metadata = json.loads(args.metadata)

    if os.getenv("CHECKER_KEY_RING_NAME") is None:
        raise ValueError("CHECKER_KEY_RING_NAME environment variable is not set")
    if os.getenv("CHECKER_KEY_REGION") is None:
        raise ValueError("CHECKER_KEY_REGION environment variable is not set")
    if os.getenv("CHECKER_FLAG_KEY_NAME") is None:
        raise ValueError("CHECKER_FLAG_KEY_NAME environment variable is not set")
    dispatch_checkers(
        project_id=project_id,
        region=region,
        current_round=current_round,
        total_teams=total_teams,
        flag_header=os.getenv("CHECKER_FLAG_HEADER", "CWARS"),
        checker_mode=checker_mode,
        metadata=metadata,
    )
