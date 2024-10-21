import json
from base64 import urlsafe_b64encode

from .jwt.kms import get_latest_version_name, sign_data, get_public_key
from .jwt.keys import get_key_fingerprint


def sign_round_flag(
    flag_header: str,
    current_round: int,
    team_id: int,
    service_name: str,
) -> str:
    key_version_name = get_latest_version_name()
    public_key = get_public_key(key_version_name)
    key_fingerprint = get_key_fingerprint(public_key)
    header = (
        urlsafe_b64encode(
            json.dumps({"typ": "JWT", "alg": "ES256", "kid": key_fingerprint}).encode()
        )
        .decode()
        .rstrip("=")
    )
    claims = (
        urlsafe_b64encode(
            json.dumps(
                {
                    "round": current_round,
                    "team_id": team_id,
                    "service_name": service_name,
                }
            ).encode()
        )
        .decode()
        .rstrip("=")
    )
    signature = (
        urlsafe_b64encode(sign_data(key_version_name, f"{header}.{claims}".encode()))
        .decode()
        .rstrip("=")
    )

    capsule = flag_header + "{"
    capsule += f"{header}.{claims}.{signature}"
    capsule += "}"
    return capsule
