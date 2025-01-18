from firebase_admin import initialize_app, firestore, credentials, auth

try:
    cred = credentials.Certificate("./secrets/serviceAccountKey.json")
    initialize_app(cred)
except:
    print("App already initialized")


def validate_token(id_token: str):
    try:
        decoded_token = auth.verify_id_token(id_token)
        email = decoded_token.get("email")
        if not email:
            return False
        return email
    except Exception:
        return False

