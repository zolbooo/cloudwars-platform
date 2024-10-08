import unittest

from dispatcher.jwt.kms import (
    zero_pad_bytes,
    extract_asn1_integer,
    convert_asn1_ec_signature,
)


# https://github.com/zolbooo/jwt-gcp-kms/blob/main/src/jwt/asn1.test.ts
class TestASN1Decoding(unittest.TestCase):
    def test_zero_pad(self):
        self.assertEqual(
            zero_pad_bytes(bytes.fromhex("01020304"), 8),
            bytes.fromhex("0000000001020304"),
        )

    def test_extract_asn1_integer(self):
        self.assertEqual(
            extract_asn1_integer(bytes.fromhex("0240" + "00" * 32 + "01" * 32)),
            bytes.fromhex("01" * 32),
        )

    def test_convert_asn1_ec_signature(self):
        self.assertEqual(
            convert_asn1_ec_signature(
                bytes.fromhex(
                    "30440220012be13f70f82f6935d1025daa0a8e237b30abff2ea865cfc0f488088831ab7702201de5571337634f3336cd644ccb639ddf49fc470059bed59c6eed146fd4d2b254"
                ),
            ),
            bytes.fromhex(
                "012BE13F70F82F6935D1025DAA0A8E237B30ABFF2EA865CFC0F488088831AB771DE5571337634F3336CD644CCB639DDF49FC470059BED59C6EED146FD4D2B254"
            ),
        )
