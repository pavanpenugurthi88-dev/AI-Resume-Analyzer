"""
MongoDB Client Initialization
"""

from pymongo import MongoClient
import logging
from app.config import settings

logger = logging.getLogger(__name__)

_mongo_client = None

def get_mongodb_client():
    global _mongo_client
    if _mongo_client is None:
        try:
            logger.info("Initializing MongoDB Client...")
            # Use settings.MONGO_URI for connection
            _mongo_client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
            # Trigger connection check (will raise Exception if offline)
            _mongo_client.admin.command('ping')
            logger.info("MongoDB connected successfully.")
        except Exception as e:
            logger.error(f"MongoDB connection failed: {e}")
            _mongo_client = None
    return _mongo_client

def get_mongodb_db():
    client = get_mongodb_client()
    if client is not None:
        return client[settings.MONGO_DB_NAME]
    return None
