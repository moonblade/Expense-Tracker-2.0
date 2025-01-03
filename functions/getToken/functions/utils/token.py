from firebase_functions import https_fn

def get_token_from_creds(req: https_fn.Request) -> https_fn.Response:
    if req.method != "POST":
        return https_fn.Response("Invalid request method. Please use POST."), 405

    token = "hello world"
    return https_fn.Response(token)
