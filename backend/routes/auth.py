from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import users_collection
from models.user import UserCreate, UserLogin, UserResponse
from utils.auth import hash_password, verify_password, create_access_token, decode_token
from bson import ObjectId
router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

@router.post("/register")
async def register(user: UserCreate):
    """Naya user register karo"""
    
    # Pehle check karo — email already registered toh nahi?
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered!")
    
    # Password hash karo
    hashed_pwd = hash_password(user.password)
    
    # User data prepare karo
    user_data = {
        "name": user.name,
        "email": user.email,
        "password": hashed_pwd,       # Hashed password store karo
        "phone": user.phone,
        "role": user.role,
        "is_active": True,
        "qr_code": None               # Baad mein generate karenge
    }
    
    # MongoDB mein save karo
    result = users_collection.insert_one(user_data)
    
    return {
        "message": "User registered successfully!",
        "user_id": str(result.inserted_id)
    }

@router.post("/login")
async def login(credentials: UserLogin):
    """User login karo aur JWT token do"""
    
    # Email se user dhundho
    user = users_collection.find_one({"email": credentials.email})
    
    # User nahi mila ya password galat
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password!")
    
    # Token banao
    token = create_access_token({
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user["role"],
        "name": user["name"]
    })
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }

# Ye function har protected route mein use hoga
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Token se current user ka data nikalo"""
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token!")
    
    user = users_collection.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found!")
    
    return user

# Role check karne ke liye
def require_role(*roles):
    async def role_checker(current_user = Depends(get_current_user)):
        if current_user["role"] not in roles:
            raise HTTPException(
                status_code=403, 
                detail=f"Access denied! Required role: {roles}"
            )
        return current_user
    return role_checker