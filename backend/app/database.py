import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

if not MONGO_URL:
    raise Exception("MONGO_URL is not set!")

client = MongoClient(MONGO_URL)
db = client["smart_blog"]

# Add this:
collection = db["posts"]
users_collection = db["users"]
