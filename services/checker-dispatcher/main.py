import os
from dispatcher import dispatch_checkers

if __name__ == "__main__":
    project_id = os.getenv("GCP_PROJECT_ID")
    if project_id is None:
        raise ValueError("GCP_PROJECT_ID environment variable is not set")
    region = os.getenv("GCP_REGION")
    if region is None:
        raise ValueError("GCP_REGION environment variable is not set")

    current_round = int(os.getenv("CHECKER_CURRENT_ROUND"), -1)
    if current_round == -1:
        raise ValueError("CHECKER_CURRENT_ROUND environment variable is not set")
    total_teams = int(os.getenv("CHECKER_TOTAL_TEAMS"), -1)
    if total_teams == -1:
        raise ValueError("CHECKER_TOTAL_TEAMS environment variable is not set")
    dispatch_checkers(
        project_id,
        region,
        current_round,
        total_teams,
        flag_header=os.getenv("CHECKER_FLAG_HEADER", "CWARS"),
    )
