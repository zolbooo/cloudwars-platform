import unittest

public_key = """-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEre7QZrfwGJR8y5CLVL/HJsxTq+yD
DL9ffwE/DSKhBu0a6CSHhQ08r0Znl7xIQPYBGan0CDh0z1l8eRSDRJso1g==
-----END PUBLIC KEY-----
"""


# See: https://github.com/zolbooo/jwt-gcp-kms/blob/main/src/public-keys.test.ts
class TestECKeyFingerpint(unittest.TestCase):
    def test_key_fingerprint(self):
        from dispatcher.jwt.keys import get_key_fingerprint

        self.assertEqual(get_key_fingerprint(public_key), "cUaIMPvYTqvoX8CRMUibK-dsmA5YB9WynBbI3jG-ld4")
