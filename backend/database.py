from pymongo import MongoClient
from dotenv import load_dotenv
import os

# .env file se values load karo
load_dotenv()

# MongoDB se connection banao
#MONGO_URL = os.getenv("MONGO_URL")
#DATABASE_NAME = os.getenv("DATABASE_NAME")
MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = "gym_db"

# Client banao — ye hamara MongoDB ka "door" hai
client = MongoClient(MONGO_URL)

# Apna database select karo
db = client[DATABASE_NAME]

# Collections (tables) define karo
users_collection = db["users"]
attendance_collection = db["attendance"]
workout_collection = db["workouts"]
subscription_collection = db["subscriptions"]