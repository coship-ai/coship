"""AES-256-GCM auth code encryption/decryption.

Provides interoperable crypto between the cockpit (TypeScript, encrypt)
and MCP server (Python, decrypt).  Both sides derive a 256-bit key via
SHA-256 of the shared COSHIP_API_SECRET.

Wire format (base64url-encoded):
    iv[12 bytes] || ciphertext || authTag[16 bytes]
"""

from __future__ import annotations

import base64
import hashlib
import json

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def _derive_key(secret: str) -> bytes:
    """Derive a 256-bit AES key from a shared secret via SHA-256."""
    return hashlib.sha256(secret.encode()).digest()


def decrypt_auth_code(code: str, secret: str) -> dict:
    """Decrypt a base64url-encoded AES-256-GCM auth code.

    Args:
        code: base64url-encoded string of iv + ciphertext + authTag
        secret: shared COSHIP_API_SECRET

    Returns:
        Decrypted JSON payload as a dict.

    Raises:
        ValueError: If decryption fails (wrong key, tampered data, etc.)
    """
    key = _derive_key(secret)

    # base64url decode — add padding if needed
    padded = code + "=" * (-len(code) % 4)
    try:
        raw = base64.urlsafe_b64decode(padded)
    except Exception as exc:
        raise ValueError("Invalid base64url encoding") from exc

    if len(raw) < 12 + 16:
        raise ValueError("Encrypted payload too short")

    iv = raw[:12]
    ct_and_tag = raw[12:]

    try:
        plaintext = AESGCM(key).decrypt(iv, ct_and_tag, None)
    except Exception as exc:
        raise ValueError("Decryption failed: invalid key or tampered data") from exc

    return json.loads(plaintext)


def encrypt_auth_code(data: dict, secret: str) -> str:
    """Encrypt a dict payload into a base64url-encoded AES-256-GCM auth code.

    This is used for testing interop; the production encrypt path lives in
    the cockpit (TypeScript).

    Args:
        data: JSON-serialisable payload
        secret: shared COSHIP_API_SECRET

    Returns:
        base64url-encoded string (no padding)
    """
    import os

    key = _derive_key(secret)
    iv = os.urandom(12)
    plaintext = json.dumps(data).encode()

    ct_and_tag = AESGCM(key).encrypt(iv, plaintext, None)
    return base64.urlsafe_b64encode(iv + ct_and_tag).decode().rstrip("=")
