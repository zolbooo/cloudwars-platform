import os
import httpx
import google.auth

from .check import ServiceStatus

credentials, project = google.auth.default()


def report_to_coordinator(service_status: ServiceStatus, round_flag: str):
    service_name = os.getenv("CHECKER_SERVICE_NAME")
    coordinator_base_url = os.getenv("GAME_COORDINATOR_URL")

    auth_token = credentials.token
    assert auth_token is not None, "Auth token is not found"
    res = httpx.post(
        f"{coordinator_base_url}/api/checkers/report",
        json={
            "service": service_name,
            "status": {
                "push": service_status.push.name,
                "pull": service_status.pull.name,
            },
            "round_flag": round_flag,
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert (
        res.status_code == 200
    ), f"Failed to report status to the game coordinator: {res.text}"
