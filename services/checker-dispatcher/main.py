import os
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
        "-e", "--flag-expiry-time", required=True, help="Flag expiry timestamp"
    )
    args = parser.parse_args()
    current_round = int(args.current_round)
    total_teams = int(args.total_teams)
    flag_expiry_time = int(args.flag_expiry_time)

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
        flag_expiry_time=flag_expiry_time,
    )
