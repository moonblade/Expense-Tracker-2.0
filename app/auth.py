from functools import cache
from firebase_admin import initialize_app, firestore, credentials, auth
import logging

try:
    cred = credentials.Certificate("./secrets/serviceAccountKey.json")
    initialize_app(cred)
except:
    print("App already initialized")

@cache
def get_email_from_uid(uid):
    """
    Fetches the email associated with a Firebase Authentication UID.

    Args:
        uid (str): The Firebase Authentication UID.

    Returns:
        str: The email address of the user.

    Raises:
        ValueError: If the UID is invalid or the user does not exist.
    """
    try:
        user = auth.get_user(uid)
        auth.update_user(uid,email="mnishamk1995@gmail.com")
        logging.info(user)
        logging.info(user.dict())
        logging.info(user.email)
        logging.info(user.uid)
        return user.email
    except auth.UserNotFoundError:
        raise ValueError(f"User with UID {uid} not found.")
    except Exception as e:
        logging.exception(e)
        raise ValueError(f"An error occurred: {str(e)}")

def validate_token(id_token: str):
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get("uid", "")
        logging.info(decoded_token)
        if not uid:
            return False
        email = get_email_from_uid(uid)
        if not email:
            return False
        return email
    except Exception as e:
        logging.error(f"Error validating token: {str(e)}")
        return False

