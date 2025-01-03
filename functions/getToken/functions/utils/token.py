from firebase_functions import https_fn
import requests

def get_token_from_creds(email, password):

    pass

def get_token_from_req(req: https_fn.Request) -> https_fn.Response:
    if req.method != "POST":
        return https_fn.Response("Invalid request method. Please use POST."), 405

    request_data = req.get_json()
    email = request_data.get("email")
    password = request_data.get("password")

    if not email or not password:
        return https_fn.Response("Email and password are required."), 400

    token = get_token_from_creds(email, password)

    return https_fn.Response(token)
