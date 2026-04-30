from fastapi import APIRouter, HTTPException, Depends
from database import users_collection
from routes.auth import get_current_user, require_role
from bson import ObjectId
import qrcode
import base64
from io import BytesIO

router = APIRouter(prefix="/members", tags=["Members"])

def generate_qr_code(member_id: str) -> str:
    """Member ke liye QR Code generate karo"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(f"GYM_CHECKIN:{member_id}")
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Image ko base64 string mein convert karo (database mein store karne ke liye)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

@router.get("/all")
async def get_all_members(current_user = Depends(require_role("admin", "trainer"))):
    """Sab members ki list — sirf Admin aur Trainer dekh sakte hain"""
    members = list(users_collection.find({"role": "member"}))
    
    result = []
    for member in members:
        result.append({
            "id": str(member["_id"]),
            "name": member["name"],
            "email": member["email"],
            "phone": member["phone"],
            "is_active": member.get("is_active", True),
            "qr_code": member.get("qr_code")
        })
    
    return result

@router.get("/profile")
async def get_my_profile(current_user = Depends(get_current_user)):
    """Apna profile dekho"""
    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "phone": current_user["phone"],
        "role": current_user["role"],
        "qr_code": current_user.get("qr_code")
    }

@router.post("/generate-qr/{member_id}")
async def generate_member_qr(
    member_id: str, 
    current_user = Depends(require_role("admin"))
):
    """Member ke liye QR Code generate karo — sirf Admin kar sakta hai"""
    
    # Member dhundho
    member = users_collection.find_one({"_id": ObjectId(member_id)})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found!")
    
    # QR Code banao
    qr_code = generate_qr_code(member_id)
    
    # Database mein save karo
    users_collection.update_one(
        {"_id": ObjectId(member_id)},
        {"$set": {"qr_code": qr_code}}
    )
    
    return {"qr_code": qr_code, "message": "QR Code generated!"}