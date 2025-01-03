# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn
from firebase_admin import initialize_app, firestore
from utils.token import get_token_from_req
import time

initialize_app()
db = firestore.client()

@https_fn.on_request()
def get_token(req: https_fn.Request) -> https_fn.Response:
    return get_token_from_req(req)

@https_fn.on_request()
def save_sms(req: https_fn.Request) -> https_fn.Response:
    token, status = get_token_from_req(req) 
    if status != 200:
        return https_fn.Response(token), status

    json_data = req.get_json()
    email = json_data.get("email")
    sms = json_data.get("sms")

    if not sms:
        return https_fn.Response("SMS is required"), 400

    timestamp = int(time.time())
    entry = {
        "sms": sms,
        "timestamp": timestamp
    }

    try:
        sms_collection = db.collection("sms").document(email).collection("messages")
        sms_doc = sms_collection.document()
        sms_doc.set(entry)
    except Exception as e:
        return https_fn.Response(f"Failed to save SMS: {str(e)}"), 400

    return https_fn.Response("SMS saved successfully"), 200

