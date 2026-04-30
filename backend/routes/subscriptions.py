from fastapi import APIRouter, HTTPException, Depends
from database import subscription_collection, users_collection
from routes.auth import get_current_user, require_role
from bson import ObjectId
from datetime import datetime, timedelta
from pydantic import BaseModel

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

class SubscriptionCreate(BaseModel):
    member_id: str
    plan: str          # "basic", "standard", "premium"
    duration_months: int

# Plans ki details
PLANS = {
    "basic": {"price": 500, "features": ["Gym Access", "Locker"]},
    "standard": {"price": 1000, "features": ["Gym Access", "Locker", "Trainer Session x4"]},
    "premium": {"price": 2000, "features": ["Gym Access", "Locker", "Unlimited Trainer", "Diet Plan"]}
}

@router.post("/create")
async def create_subscription(
    sub: SubscriptionCreate,
    current_user = Depends(require_role("admin"))
):
    """Member ko subscription assign karo — sirf Admin"""
    
    # Check karo plan valid hai ya nahi
    if sub.plan not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan! Choose: basic, standard, premium")
    
    # Dates calculate karo
    start_date = datetime.now()
    end_date = start_date + timedelta(days=30 * sub.duration_months)
    
    subscription_data = {
        "member_id": sub.member_id,
        "plan": sub.plan,
        "price": PLANS[sub.plan]["price"] * sub.duration_months,
        "start_date": start_date,
        "end_date": end_date,
        "is_active": True,
        "features": PLANS[sub.plan]["features"]
    }
    
    # Purana subscription deactivate karo
    subscription_collection.update_many(
        {"member_id": sub.member_id, "is_active": True},
        {"$set": {"is_active": False}}
    )
    
    result = subscription_collection.insert_one(subscription_data)
    
    return {
        "message": "Subscription created!",
        "plan": sub.plan,
        "valid_till": end_date.strftime("%d %B %Y"),
        "subscription_id": str(result.inserted_id)
    }

@router.get("/my-subscription")
async def my_subscription(current_user = Depends(get_current_user)):
    """Apni subscription dekho"""
    sub = subscription_collection.find_one({
        "member_id": str(current_user["_id"]),
        "is_active": True
    })
    
    if not sub:
        return {"message": "No active subscription"}
    
    days_left = (sub["end_date"] - datetime.now()).days
    
    return {
        "plan": sub["plan"],
        "features": sub["features"],
        "valid_till": sub["end_date"].strftime("%d %B %Y"),
        "days_left": max(0, days_left),
        "is_expired": days_left < 0
    }