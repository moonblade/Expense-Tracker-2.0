# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn
from firebase_admin import initialize_app
from utils.token import get_token_from_creds

initialize_app()

@https_fn.on_request()
def get_token(req: https_fn.Request) -> https_fn.Response:
    return get_token_from_creds(req)
