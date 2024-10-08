from enum import Enum
from dataclasses import dataclass

Status = Enum("ServiceStatus", ["UP", "MUMBLE", "CORRUPT", "DOWN"])


@dataclass
class ServiceStatus:
    push: Status
    pull: Status


def check(target_ip: str, round_flag: str) -> ServiceStatus:
    return ServiceStatus(push=Status.UP, pull=Status.UP)
