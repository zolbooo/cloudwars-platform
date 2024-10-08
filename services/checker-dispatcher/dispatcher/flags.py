from base64 import urlsafe_b64encode
from google.cloud import kms

client = kms.KeyManagementServiceClient()


def sign_round_flag(
    flag_header: str, current_round: int, team_id: int, service_name: str
) -> str:
    capsule = flag_header + "{"
    capsule += "}"
    return capsule
