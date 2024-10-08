import os
import httpx
import google.oauth2.id_token
import google.auth.transport.requests

from .check import ServiceStatus


def report_to_coordinator(service_status: ServiceStatus, round_flag: str):
    service_name = os.getenv("CHECKER_SERVICE_NAME")
    coordinator_base_url = os.getenv("GAME_COORDINATOR_URL")

    id_token = google.oauth2.id_token.fetch_id_token(
        request=google.auth.transport.requests.Request(),
        audience=coordinator_base_url,
    )
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
        headers={"Authorization": f"Bearer {id_token}"},
    )
    assert (
        res.status_code == 200
    ), f"Failed to report status to the game coordinator: {res.text}"
