import os
import hashlib
from typing import List
from google.cloud import kms

client = kms.KeyManagementServiceClient()


_flag_key_path = client.crypto_key_path(
    project=os.getenv("GCP_PROJECT_ID"),
    location=os.getenv("CHECKER_KEY_REGION"),
    key_ring=os.getenv("CHECKER_KEY_RING_NAME"),
    crypto_key=os.getenv("CHECKER_FLAG_KEY_NAME"),
)


def get_latest_version_name() -> str:
    version = next(
        client.list_crypto_key_versions(
            request=kms.ListCryptoKeyVersionsRequest(
                parent=_flag_key_path, filter="state=ENABLED", order_by="name desc"
            )
        ).pages
    )
    return version.crypto_key_versions[0].name


def get_public_key(key_version_name: str) -> str:
    return client.get_public_key(
        request=kms.GetPublicKeyRequest(name=key_version_name)
    ).pem


def get_public_keys() -> List[str]:
    versions = client.list_crypto_key_versions(
        request={
            "parent": client.crypto_key_path(
                project=os.getenv("GCP_PROJECT_ID"),
                location=os.getenv("CHECKER_KEY_REGION"),
                key_ring=os.getenv("CHECKER_KEY_RING_NAME"),
                crypto_key=os.getenv("CHECKER_FLAG_KEY_NAME"),
            ),
            "filter": "state=ENABLED",
        },
    )
    return list(
        map(
            lambda key_version: get_public_key(key_version.name),
            versions,
        )
    )


def extract_asn1_integer(sequence: bytes):
    assert (
        sequence[0] == 0x02 and len(sequence) >= 2
    ), f"Expected ASN.1 INTEGER, got {sequence[:2].hex()}"
    integer = sequence[2 : 2 + sequence[1]]

    offset = 0
    while offset < len(integer) and integer[offset] == 0:
        offset += 1
    return integer[offset:]


def zero_pad_bytes(number: bytes, size=32):
    assert len(number) <= size
    return bytes([0] * (size - len(number))) + number


def convert_asn1_ec_signature(sequence: bytes):
    assert (
        sequence[0] == 0x30 and len(sequence) >= 2
    ), "Invalid signature, expected ASN.1 SEQUENCE"

    sequence = sequence[2:]
    r = extract_asn1_integer(sequence)
    sequence = sequence[2 + sequence[1] :]
    s = extract_asn1_integer(sequence)
    return zero_pad_bytes(r) + zero_pad_bytes(s)


def sign_data(key_version_name: str, data: bytes) -> bytes:
    digest = hashlib.sha256(data).digest()
    response = client.asymmetric_sign(
        request=kms.AsymmetricSignRequest(
            name=key_version_name, digest={"sha256": digest}
        )
    )
    asn1_signature = response.signature
    return convert_asn1_ec_signature(asn1_signature)
