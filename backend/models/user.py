from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

# Role Enum — sirf ye 3 roles allowed hain
class UserRole(str, Enum):
    admin = "admin"
    trainer = "trainer"
    member = "member"

# Naya user banate waqt ye data chahiye
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    role: UserRole = UserRole.member  # Default role = member

# Login ke waqt ye data chahiye
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Database se data return karte waqt (password nahi bhejte!)
class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: str
    is_active: bool