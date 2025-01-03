from firebase_functions import https_fn
import requests

with open("./secrets/firebaseapikey", "r") as f:
    FIREBASE_API_KEY = f.read().strip()

def get_token_from_creds(email, password):
    response = requests.post(f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}", json={
        "email": email,
        "password": password,
        "returnSecureToken": True
    })
    if response.status_code != 200:
        return False, "Invalid credentials"
    return True, response.json().get("idToken")

def get_token_from_req(req: https_fn.Request) -> https_fn.Response:
    if req.method != "POST":
        return https_fn.Response("Invalid request method. Please use POST."), 405

    request_data = req.get_json()
    email = request_data.get("email")
    password = request_data.get("password")

    if not email or not password:
        return https_fn.Response("Email and password are required."), 400

    success, token = get_token_from_creds(email, password)
    if not success:
        return https_fn.Response(token), 401

    return https_fn.Response(token), 200
