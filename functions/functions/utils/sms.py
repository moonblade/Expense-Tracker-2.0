import logging
from firebase_functions import https_fn
from firebase_admin import firestore
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')

db = firestore.client()

def save_sms_from_req(req: https_fn.Request) -> https_fn.Response:
    logging.info("Received request to save SMS")

    json_data = req.get_json()
    email = json_data.get("email")
    sms = json_data.get("sms")
    sender = json_data.get("sender")

    if not sms:
        logging.warning("Validation failed: SMS is required")
        return https_fn.Response("SMS is required"), 400

    timestamp = int(time.time())
    entry = {
        "sms": sms,
        "sender": sender,
        "timestamp": timestamp
    }

    try:
        sms_collection = db.collection("sms").document(email).collection("messages")
        sms_doc = sms_collection.document()
        sms_doc.set(entry)
        logging.info(f"SMS saved successfully for email: {email}")
    except Exception as e:
        logging.error(f"Failed to save SMS for email: {email}, error: {str(e)}")
        return https_fn.Response(f"Failed to save SMS: {str(e)}"), 400

    return https_fn.Response("SMS saved successfully"), 200

