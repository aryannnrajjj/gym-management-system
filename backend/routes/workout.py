from fastapi import APIRouter, HTTPException, Depends
from database import workout_collection
from models.workout import WorkoutPlan
from routes.auth import get_current_user, require_role
from bson import ObjectId

router = APIRouter(prefix="/workouts", tags=["Workout Plans"])

@router.post("/create")
async def create_workout(
    plan: WorkoutPlan,
    current_user = Depends(require_role("admin", "trainer"))
):
    plan_data = plan.dict()
    plan_data["trainer_id"] = str(current_user["_id"])
    plan_data["trainer_name"] = current_user["name"]
    # assigned_to empty string hai toh None karo
    if not plan_data.get("assigned_to"):
        plan_data["assigned_to"] = None
    
    result = workout_collection.insert_one(plan_data)
    return {"message": "Workout plan created!", "id": str(result.inserted_id)}

@router.get("/all")
async def get_all_workouts(current_user = Depends(get_current_user)):
    """Sab workout plans dekho"""
    workouts = list(workout_collection.find())
    result = []
    for w in workouts:
        w["id"] = str(w["_id"])
        del w["_id"]
        result.append(w)
    return result

@router.get("/my-plan")
async def my_workout_plan(current_user = Depends(get_current_user)):
    """Apna assigned workout plan dekho"""
    plan = workout_collection.find_one({"assigned_to": str(current_user["_id"])})
    
    if not plan:
        return {"message": "No workout plan assigned yet"}
    
    plan["id"] = str(plan["_id"])
    del plan["_id"]
    return plan