from typing import List
from models import Message, MessageStatus, Pattern, Sender, Transaction
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter
import datetime
from functools import cache

db = firestore.client()

def read_messages(email, days_ago_start=30):
    start_date = datetime.datetime.utcnow() - datetime.timedelta(days=days_ago_start)
    start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    start_timestamp = int(start_date.timestamp())

    sms_collection = db.collection("sms").document(email).collection("messages")
    filter_condition = FieldFilter("timestamp", ">=", start_timestamp)
    query = sms_collection.where(filter=filter_condition).order_by("timestamp", direction=firestore.Query.DESCENDING).stream()

    messages = []
    for doc in query:
        doc_dict = doc.to_dict()
        doc_dict["id"] = doc.id
        messages.append(Message(**doc_dict))

    return messages

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

def update_senders(senders: List[Sender]):
    sender_collection = db.collection("sender")

    for sender in senders:
        sender_collection.document(sender.name).set(sender.dict())
    get_senders.cache_clear()

def upsert_pattern(pattern: Pattern):
    pattern_collection = db.collection("pattern")
    if pattern.id and pattern_collection.document(pattern.id).get().exists:
        pattern_collection.document(pattern.id).set(pattern.dict())
    else:
        pattern_collection.add(pattern.dict())
    get_patterns.cache_clear()
    return True

@cache
def get_patterns():
    pattern_collection = db.collection("pattern")
    query = pattern_collection.order_by("action").stream()
    patterns = []
    for doc in query:
        doc_dict = doc.to_dict()
        doc_dict["id"] = doc.id
        patterns.append(Pattern(**doc_dict))
    return patterns

@cache
def get_senders():
    sender_collection = db.collection("sender")
    query = sender_collection.stream()
    senders = []
    for doc in query:
        doc_dict = doc.to_dict()
        doc_dict["id"] = doc.id
        senders.append(Sender(**doc_dict))
    return senders

def update_message_status(email: str, messages: List[Message]):
    if not messages:
        return

    batch = db.batch()

    for message in messages:
        sms_doc_ref = db.collection("sms").document(email).collection("messages").document(message.id)
        batch.update(sms_doc_ref, {"status": message.status.value, "matchedPattern": message.matchedPattern})

    try:
        batch.commit()
    except Exception as e:
        print(f"Error updating message statuses: {e}")

def add_transactions(email: str, transactions: List[Transaction]):
    if not transactions:
        return False

    batch = db.batch()

    for transaction in transactions:
        transaction_ref = db.collection("transaction").document(email).collection("transaction").document(transaction.id)
        batch.set(transaction_ref, transaction.dict(), merge=True)

    try:
        batch.commit()
    except Exception as e:
        print(f"Error updating message statuses: {e}")

def get_transactions(email, days_ago_start=30):
    start_date = datetime.datetime.utcnow() - datetime.timedelta(days=days_ago_start)
    start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    start_timestamp = int(start_date.timestamp())

    transaction_collection = db.collection("transaction").document(email).collection("transaction")
    filter_condition = FieldFilter("timestamp", ">=", start_timestamp)
    query = transaction_collection.where(filter=filter_condition).order_by("timestamp", direction=firestore.Query.DESCENDING).stream()

    transactions = []
    for doc in query:
        doc_dict = doc.to_dict()
        transactions.append(Transaction(**doc_dict))

    return transactions

def get_transaction(email, transaction_id):
    transaction_ref = db.collection("transaction").document(email).collection("transaction").document(transaction_id)
    transaction = transaction_ref.get()
    if transaction.exists:
        return Transaction(**transaction.to_dict())
    return None

def update_transaction(email, transaction_id, transaction):
    transaction_ref = db.collection("transaction").document(email).collection("transaction").document(transaction_id)
    transaction_ref.set(transaction.dict(), merge=True)
