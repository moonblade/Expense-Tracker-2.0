# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn
from firebase_admin import initialize_app
from utils.sms import save_sms_from_req
from utils.token import get_token_from_req

initialize_app()

@https_fn.on_request()
def get_token(req: https_fn.Request) -> https_fn.Response:
    return get_token_from_req(req)

@https_fn.on_request()
def save_sms(req: https_fn.Request) -> https_fn.Response:
    token, status = get_token_from_req(req) 
    if status != 200:
        return https_fn.Response(token), status
    return save_sms_from_req(req)

