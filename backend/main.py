from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, members, attendance, subscriptions, workout

app = FastAPI(
    title="Gym Management System API",
    description="Complete Gym Management with QR Attendance",
    version="1.0.0"
)

# CORS — frontend ko backend se baat karne do
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://gym-management-system-six-alpha.vercel.app",  # ← YE ADD KARO
        "*"  # ← YE BHI ADD KARO
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Routes register karo
app.include_router(auth.router)
app.include_router(members.router)
app.include_router(attendance.router)
app.include_router(subscriptions.router)
app.include_router(workout.router)

@app.get("/")
def root():
    return {"message": "Gym Management API is running! 💪", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "ok"}