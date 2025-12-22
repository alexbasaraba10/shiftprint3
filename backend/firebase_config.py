import firebase_admin
from firebase_admin import credentials, auth
import os

# Initialize Firebase Admin
cred = credentials.Certificate('/app/backend/firebase-admin.json')

try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app(cred)

def verify_firebase_token(token: str):
    """Verify Firebase ID token"""
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None

def get_user_by_phone(phone: str):
    """Get user by phone number"""
    try:
        user = auth.get_user_by_phone_number(phone)
        return user
    except Exception:
        return None
