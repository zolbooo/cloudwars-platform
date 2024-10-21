from enum import Enum
from typing import Literal, Optional

Status = Enum("ServiceStatus", ["UP", "MUMBLE", "CORRUPT", "DOWN"])


def check(
    mode: Literal["push", "pull"], target_ip: str, round_flag: Optional[str]
) -> Status:
    return Status.UP
