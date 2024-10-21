from typing import Any, Literal
import os

from .jobs import list_checker_jobs, invoke_checker
from .flags import sign_round_flag


def dispatch_checkers(
    project_id: str,
    region: str,
    current_round: int,
    total_teams: int,
    flag_header: str,
    checker_mode: Literal["push", "pull"],
    metadata: Any,
):
    checker_jobs = list_checker_jobs(project_id, region)
    for checker in checker_jobs:
        assert "service_name" in checker.labels
        service_name = checker.labels["service_name"]
        for team_id in range(1, total_teams + 1):
            target_ip = os.getenv("CHECKER_INSTANCE_IP_FORMAT", "10.124.x.10").replace(
                "x", str(team_id)
            )
            round_flag = (
                sign_round_flag(
                    flag_header=flag_header,
                    current_round=current_round,
                    team_id=team_id,
                    service_name=service_name,
                )
                if checker_mode == "push"
                else None
            )
            invoke_checker(
                checker=checker,
                target_ip=target_ip,
                checker_mode=checker_mode,
                round_flag=round_flag,
                metadata=metadata,
            )
