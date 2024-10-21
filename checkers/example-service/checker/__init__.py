from typing import Any, Literal, Optional

from .check import check
from .report import report_to_coordinator


def run_checker(
    mode: Literal["push", "pull"],
    target_ip: str,
    round_flag: Optional[str],
    metadata: Any,
):
    service_status = check(mode=mode, target_ip=target_ip, round_flag=round_flag)
    report_to_coordinator(
        mode=mode,
        service_status=service_status,
        round_flag=round_flag,
        metadata=metadata,
    )
