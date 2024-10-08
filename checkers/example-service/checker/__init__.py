from .check import check
from .report import report_to_coordinator


def run_checker(target_ip: str, round_flag: str):
    service_status = check(target_ip, round_flag)
    report_to_coordinator(service_status)
