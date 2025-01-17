from models import Sender
from firebase_admin import initialize_app, firestore, credentials
from google.cloud.firestore_v1.base_query import FieldFilter
import datetime
from functools import cache

try:
    cred = credentials.Certificate("./secrets/serviceAccountKey.json")
    initialize_app(cred)
except:
    print("App already initialized")

db = firestore.client()

def read_sms_from_last_30_days(email):
    if not email:
        raise Exception("Email is required")

    # Get the current time and calculate the timestamp for 30 days ago
    now = datetime.datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    start_timestamp = int(start_of_month.timestamp())

    # Query the Firestore collection
    sms_collection = db.collection("sms").document(email).collection("messages")
    filter_condition = FieldFilter("timestamp", ">=", start_timestamp)
    query = sms_collection.where(filter=filter_condition).order_by("timestamp").stream()

    # Collect the results
    messages = []
    for doc in query:
        messages.append(doc.to_dict())

    return messages

def add_sender(sender: Sender):
    sender_collection = db.collection("sender")
    if sender_collection.document(sender.name).get().exists:
        return
    sender_collection.document(sender.name).set(sender.dict())
    get_senders.cache_clear()

@cache
def get_senders():
    sender_collection = db.collection("sender")
    query = sender_collection.stream()
    senders = []
    for doc in query:
        doc = doc.to_dict()
        senders.append(Sender(**doc))
    return senders
