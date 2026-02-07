"""Unit tests for AES-256-GCM auth code crypto."""

from __future__ import annotations

import pytest

from coship_mcp.auth_code import decrypt_auth_code, encrypt_auth_code


class TestEncryptDecryptRoundtrip:
    def test_roundtrip(self, api_secret: str):
        payload = {
            "access_token": "at-123",
            "refresh_token": "rt-456",
            "expires_in": 3600,
        }
        code = encrypt_auth_code(payload, api_secret)
        result = decrypt_auth_code(code, api_secret)
        assert result == payload

    def test_decrypt_with_wrong_key_fails(self, api_secret: str):
        payload = {"access_token": "at-123"}
        code = encrypt_auth_code(payload, api_secret)
        with pytest.raises(ValueError, match="Decryption failed"):
            decrypt_auth_code(code, "wrong-secret-key")

    def test_decrypt_tampered_data_fails(self, api_secret: str):
        payload = {"access_token": "at-123"}
        code = encrypt_auth_code(payload, api_secret)
        # Flip a character in the middle of the code
        chars = list(code)
        mid = len(chars) // 2
        chars[mid] = "A" if chars[mid] != "A" else "B"
        tampered = "".join(chars)
        with pytest.raises(ValueError):
            decrypt_auth_code(tampered, api_secret)

    def test_code_contains_expected_fields(self, api_secret: str):
        payload = {
            "access_token": "at-xyz",
            "refresh_token": "rt-xyz",
            "expires_in": 7200,
        }
        code = encrypt_auth_code(payload, api_secret)
        result = decrypt_auth_code(code, api_secret)
        assert "access_token" in result
        assert "refresh_token" in result
        assert "expires_in" in result
        assert result["expires_in"] == 7200
