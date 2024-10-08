import hashlib
from base64 import urlsafe_b64encode
from cryptography.hazmat.primitives.serialization import (
    load_pem_public_key,
    Encoding,
    PublicFormat,
)


def get_key_fingerprint(public_key_pem: str) -> str:
    public_key = load_pem_public_key(public_key_pem.encode())
    der_spki_key = public_key.public_bytes(
        encoding=Encoding.DER, format=PublicFormat.SubjectPublicKeyInfo
    )
    hash = hashlib.sha256(der_spki_key).digest()
    fingerprint = urlsafe_b64encode(hash).decode().rstrip("=")
    return fingerprint
