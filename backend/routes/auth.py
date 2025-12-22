from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import hashlib

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: str
    email: str

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Admin login"""
    admin_emails = [
        os.environ.get('ADMIN_EMAIL_1'),
        os.environ.get('ADMIN_EMAIL_2'),
        os.environ.get('ADMIN_EMAIL_3')
    ]
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if request.email in admin_emails and request.password == admin_password:
        # Generate simple token (in production use JWT)
        token = hash_password(f"{request.email}:{request.password}")
        return LoginResponse(
            success=True,
            token=token,
            email=request.email
        )
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/contact-info")
async def get_contact_info():
    """Get contact information"""
    return {
        "telegram": f"https://t.me/{os.environ.get('TELEGRAM_USERNAME', 'Shiftprint')}",
        "whatsapp": os.environ.get('WHATSAPP_LINK', 'https://wa.me/37360972200')
    }
