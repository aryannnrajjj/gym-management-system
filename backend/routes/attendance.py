from fastapi import APIRouter, HTTPException, Depends
from database import attendance_collection, users_collection
from routes.auth import get_current_user, require_role
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/checkin")
async def check_in(data: dict, current_user = Depends(require_role("admin", "trainer"))):
    """QR Scan ke baad member ko check-in karo"""
    
    qr_data = data.get("qr_data", "")
    
    # QR data format: "GYM_CHECKIN:member_id"
    if not qr_data.startswith("GYM_CHECKIN:"):
        raise HTTPException(status_code=400, detail="Invalid QR Code!")
    
    member_id = qr_data.replace("GYM_CHECKIN:", "")
    
    # Member dhundho
    member = users_collection.find_one({"_id": ObjectId(member_id)})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found!")
    
    # Aaj ka attendance check karo — already checked in toh nahi?
    today = datetime.now().strftime("%Y-%m-%d")
    existing = attendance_collection.find_one({
        "member_id": member_id,
        "date": today,
        "check_out_time": None  # Agar check_out nahi hua toh abhi inside hai
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Member already checked in today!")
    
    # Attendance record banao
    attendance_data = {
        "member_id": member_id,
        "member_name": member["name"],
        "check_in_time": datetime.now(),
        "check_out_time": None,
        "date": today
    }
    
    result = attendance_collection.insert_one(attendance_data)
    
    return {
        "message": f"{member['name']} checked in successfully!",
        "attendance_id": str(result.inserted_id),
        "time": datetime.now().strftime("%I:%M %p")
    }

@router.post("/checkout/{attendance_id}")
async def check_out(attendance_id: str, current_user = Depends(require_role("admin", "trainer"))):
    """Member ko check-out karo"""
    
    attendance = attendance_collection.find_one({"_id": ObjectId(attendance_id)})
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found!")
    
    attendance_collection.update_one(
        {"_id": ObjectId(attendance_id)},
        {"$set": {"check_out_time": datetime.now()}}
    )
    
    return {"message": "Checked out successfully!"}

@router.get("/today")
async def today_attendance(current_user = Depends(require_role("admin", "trainer"))):
    """Aaj ke sab attendance records"""
    today = datetime.now().strftime("%Y-%m-%d")
    records = list(attendance_collection.find({"date": today}))
    
    result = []
    for record in records:
        result.append({
            "id": str(record["_id"]),
            "member_name": record["member_name"],
            "check_in_time": record["check_in_time"].strftime("%I:%M %p"),
            "check_out_time": record["check_out_time"].strftime("%I:%M %p") if record.get("check_out_time") else "Still Inside",
            "date": record["date"]
        })
    
    return result

@router.get("/member/{member_id}")
async def member_attendance(member_id: str, current_user = Depends(get_current_user)):
    """Kisi ek member ki poori attendance history"""
    records = list(attendance_collection.find({"member_id": member_id}).sort("date", -1))
    
    result = []
    for record in records:
        result.append({
            "date": record["date"],
            "check_in": record["check_in_time"].strftime("%I:%M %p"),
            "check_out": record["check_out_time"].strftime("%I:%M %p") if record.get("check_out_time") else "N/A"
        })
    
    return result