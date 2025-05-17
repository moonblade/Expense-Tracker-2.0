from typing import List
from models import Category, Message, MessageStatus, Pattern, Sender, Transaction
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter
import datetime
from functools import cache
import time
import logging
import threading

from utils import get_start_and_end_of_month, measure_time

db = firestore.client()

def read_messages(email, days_ago_start=30, admin_mode=False):
    start_date = datetime.datetime.now() - datetime.timedelta(days=days_ago_start)
    start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    start_timestamp = int(start_date.timestamp())

    messages = []

    if admin_mode:
        # If admin_mode is True, iterate through all emails in the "sms" collection
        sms_collection = db.collection("sms")
        all_emails = sms_collection.stream()
        for email_doc in all_emails:
            email_id = email_doc.id
            email_collection = sms_collection.document(email_id).collection("messages")
            filter_condition = FieldFilter("timestamp", ">=", start_timestamp)
            query = email_collection.where(filter=filter_condition).order_by("timestamp", direction=firestore.Query.DESCENDING).stream()
            for doc in query:
                doc_dict = doc.to_dict()
                doc_dict["id"] = doc.id
                messages.append(Message(**doc_dict))
    else:
        # If admin_mode is False, only get messages for the specified email
        sms_collection = db.collection("sms").document(email).collection("messages")
        filter_condition = FieldFilter("timestamp", ">=", start_timestamp)
        query = sms_collection.where(filter=filter_condition).order_by("timestamp", direction=firestore.Query.DESCENDING).stream()

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

def upsert_pattern(pattern: Pattern, email: str = "") -> bool:
    pattern.createdBy = email
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

@cache
def get_emails():
    sms_collection = db.collection("sms")
    emails = [doc.id for doc in sms_collection.stream()]
    return emails

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

def add_transactions_db(email: str, transactions: List[Transaction]):
    if not transactions:
        return False

    batch = db.batch()

    for transaction in transactions:
        transaction_ref = db.collection("transaction").document(email).collection("transaction").document(transaction.id)

        if not transaction_ref.get().exists:
            batch.set(transaction_ref, transaction.dict(), merge=True)

    try:
        batch.commit()
        get_transactions.cache_clear()
        populate_get_transactions_cache_thread(email)
        return True
    except Exception as e:
        print(f"Error updating transactions: {e}")
        return False

def populate_get_transactions_cache_thread(email):
    thread = threading.Thread(target=populate_get_transactions_cache, args=(email,))
    thread.start()

def populate_get_transactions_cache(email):
    logging.warn(f"Populating cache for transactions for email: {email}")
    start_date, end_date = get_start_and_end_of_month()
    logging.warn(f"Start date: {start_date}, End date: {end_date}")
    _ = get_transactions(email, start_date, end_date)

@cache
def get_transactions(email, from_date=None, to_date=None):
    transaction_collection = db.collection("transaction").document(email).collection("transaction")
    query = transaction_collection.order_by("timestamp", direction=firestore.Query.DESCENDING)

    if from_date is not None and from_date != 0:
        if len(str(from_date)) == 13:
            from_date /= 1000 
        from_date_dt = datetime.datetime.utcfromtimestamp(from_date)
        query = query.where(filter=FieldFilter("timestamp", ">=", int(from_date_dt.timestamp())))

    if to_date is not None and to_date != 0:
        if len(str(to_date)) == 13:
            to_date /= 1000
        to_date_dt = datetime.datetime.utcfromtimestamp(to_date)
        query = query.where(filter=FieldFilter("timestamp", "<=", int(to_date_dt.timestamp())))

    query_stream = query.stream()

    transactions = []
    for doc in query_stream:
        doc_dict = doc.to_dict()
        transactions.append(Transaction(**doc_dict))

    return transactions

@cache
def get_transaction_uncached(email, transaction_id):
    transaction = get_transaction(email, transaction_id)
    if transaction:
        return transaction
    get_transaction.cache_clear()
    return get_transaction(email, transaction_id)

@cache
def get_transaction(email, transaction_id):
    transaction_ref = db.collection("transaction").document(email).collection("transaction").document(transaction_id)
    transaction = transaction_ref.get()
    if transaction.exists:
        return Transaction(**transaction.to_dict())
    return None

@measure_time
def update_transaction(email, transaction_id, transaction):
    transaction_ref = db.collection("transaction").document(email).collection("transaction").document(transaction_id)
    transaction_ref.set(transaction.dict(), merge=True)
    get_transaction.cache_clear()
    get_transactions.cache_clear()
    populate_get_transactions_cache_thread(email)

@cache
def get_merchants():
    merchant_collection = db.collection("merchant")
    query = merchant_collection.stream()
    merchants = {}
    for doc in query:
        doc_dict = doc.to_dict()
        merchants[doc.id] = doc_dict
    return merchants

@cache
def get_user_details(email):
    user_ref = db.collection("users").document(email)
    user = user_ref.get()
    if user.exists:
        return user.to_dict()
    return None

@cache
def is_admin(email):
    user = get_user_details(email)
    if user and user.get("role") == "admin":
        return True
    return False

def delete_pattern(email: str, pattern_id: str) -> bool:
    if not is_admin(email):
        return False

    pattern_collection = db.collection("pattern").document(email).collection("patterns")
    pattern_ref = pattern_collection.document(pattern_id)
    
    if pattern_ref.get().exists:
        pattern_ref.delete()
        get_patterns.cache_clear(email)
        return True
    return False

def save_sms(email: str, sms: str, sender: str, id: str = ""):
    timestamp = int(time.time())
    entry = {
        "sms": sms,
        "sender": sender,
        "timestamp": timestamp
    }

    try:
        sms_collection = db.collection("sms").document(email).collection("messages")
        if id:
            sms_doc = sms_collection.document(id)
            if sms_doc.get().exists:
                sms_doc.set(entry, merge=True)
            else:
                sms_doc.set(entry)
        else:
            sms_doc = sms_collection.document()
            sms_doc.set(entry)
        logging.info(f"SMS saved successfully for email: {email}")
    except Exception as e:
        logging.error(f"Error saving SMS for email: {email}: {e}")

@measure_time
def add_merchant(merchant: str, category: Category):
    try:
        merchant_collection = db.collection("merchant")
        merchant_collection.document(merchant).set({"category": category.value}, merge=True)
        get_merchants.cache_clear()
    except Exception as e:
        logging.error(f"Error adding merchant: {merchant}: {e}")
