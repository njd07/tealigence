"""
Authentication helpers for Tealigence.
Handles JWT token creation/validation and password hashing.
Uses SQLite for registered user storage.
"""

import os
import sqlite3
import jwt
import datetime
from passlib.hash import bcrypt
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "tealigence-secret-key")
JWT_ALGORITHM = "HS256"
DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")

# Hardcoded admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin"


def init_users_db():
    """Create the users table if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def create_token(username: str) -> str:
    """Create a JWT token for a user."""
    payload = {
        "sub": username,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24),
        "iat": datetime.datetime.now(datetime.timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> dict | None:
    """Verify and decode a JWT token. Returns payload or None."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.verify(password, password_hash)


def authenticate_user(username: str, password: str) -> str | None:
    """
    Authenticate a user. Check hardcoded admin first, then SQLite.
    Returns a JWT token on success, None on failure.
    """
    # Check hardcoded admin
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        return create_token(username)

    # Check registered users
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()

    if row and verify_password(password, row[0]):
        return create_token(username)

    return None


def register_user(username: str, password: str) -> tuple[bool, str]:
    """
    Register a new user. Returns (success, message).
    """
    if username == ADMIN_USERNAME:
        return False, "Username 'admin' is reserved."

    if len(username) < 3:
        return False, "Username must be at least 3 characters."

    if len(password) < 4:
        return False, "Password must be at least 4 characters."

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username, hash_password(password)),
        )
        conn.commit()
        return True, "Registration successful!"
    except sqlite3.IntegrityError:
        return False, "Username already exists."
    finally:
        conn.close()


# Initialize the database on import
init_users_db()
