from firebase_admin import initialize_app, firestore, credentials
import datetime

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
    query = sms_collection.where("timestamp", ">=", start_timestamp).stream()

    # Collect the results
    messages = []
    for doc in query:
        messages.append(doc.to_dict())

    return messages
