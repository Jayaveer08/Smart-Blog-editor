import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

class MockCollection:
    def __init__(self, name):
        self.name = name
        self.data = {}
    
    def insert_one(self, doc):
        from bson import ObjectId
        if "_id" not in doc:
            doc["_id"] = ObjectId()
        self.data[str(doc["_id"])] = doc
        class Result:
            inserted_id = doc["_id"]
        return Result()

    def find_one(self, query):
        from bson import ObjectId
        for doc in self.data.values():
            match = True
            for k, v in query.items():
                if k == "_id":
                    if str(doc.get("_id")) != str(v):
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc.copy()
        return None

    def find(self, query=None):
        if not query:
            return ListCursor(list(self.data.values()))
        res = []
        for doc in self.data.values():
            match = True
            for k, v in query.items():
                if k == "_id":
                    if str(doc.get("_id")) != str(v):
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                res.append(doc.copy())
        return ListCursor(res)

    def update_one(self, query, update):
        doc = self.find_one(query)
        if doc:
            doc_id = str(doc["_id"])
            if "$set" in update:
                for k, v in update["$set"].items():
                    self.data[doc_id][k] = v
            return True
        return False

    def delete_one(self, query):
        doc = self.find_one(query)
        if doc:
            del self.data[str(doc["_id"])]
            return True
        return False

class ListCursor:
    def __init__(self, items):
        self.items = items
    def sort(self, key, direction=-1):
        self.items.sort(key=lambda x: x.get(key, 0), reverse=(direction == -1))
        return self
    def __iter__(self):
        return iter(self.items)
    def __list__(self):
        return self.items

class MockDB:
    def __init__(self):
        self.collections = {}
    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection(name)
        return self.collections[name]

# Try connecting to MongoDB safely
try:
    if not MONGO_URL:
        raise Exception("MONGO_URL not set")
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=2000, connectTimeoutMS=2000)
    # Check connection
    client.admin.command('ping')
    db = client["smart_blog"]
    collection = db["posts"]
    users_collection = db["users"]
    print("✅ Connected to MongoDB successfully!")
except Exception as e:
    print(f"⚠️ MongoDB connection fallback active: {e}")
    db = MockDB()
    collection = db["posts"]
    users_collection = db["users"]

