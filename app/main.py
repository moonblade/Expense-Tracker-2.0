import os
from auth import validate_token
from typing import List
from models import CategorizeTransactionRequest, IgnoreTransactionRequest, Pattern, UpdateSendersRequest
from fastapi import FastAPI, Security, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from parser import parseMessages
from db import get_patterns, get_senders, get_transactions, read_messages, read_sms_from_last_30_days, upsert_pattern, update_senders
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from transactions import categorize_transaction, ignore_transaction, unignore_transaction
import uvicorn
import logging

jwt_bearer = HTTPBearer(auto_error=False)
logging.basicConfig(level=logging.INFO)

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

origins = [
    "http://localhost",
    "http://localhost:9000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def getEmail(credentials: HTTPAuthorizationCredentials = Security(jwt_bearer)) -> str:
    if credentials and credentials.scheme == "Bearer":
        email = validate_token(credentials.credentials)
        if email:
            return email
        raise HTTPException(status_code=401, detail="Invalid token")
    raise HTTPException(status_code=401, detail="Missing token")

@app.get("/")
def ui() -> str:
    return FileResponse(os.path.join("static", "expense-tracker", "index.html"))

@app.post("/processmessages")
def process_messages(email = Security(getEmail)):
    messages = read_messages(email)
    parseMessages(email, messages)
    return {"status": "success", "message": "Messages processed successfully"}

@app.get("/messages")
def messages(email = Security(getEmail)):
    messages = read_messages(email)
    messages = {"messages": [message.dict() for message in messages]}
    return messages

@app.post("/senders")
def _update_senders(updateSendersRequest: UpdateSendersRequest, email = Security(getEmail)):
    update_senders(updateSendersRequest.senders)
    return "ok"

@app.get("/patterns")
def patterns(email = Security(getEmail)):
    patterns = get_patterns()
    return {"patterns": patterns}

@app.post("/patterns")
def _upsert_pattern(pattern: Pattern):
    success = upsert_pattern(pattern)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid pattern")
    return "ok"

@app.get("/senders")
def _get_senders(email = Security(getEmail)):
    senders = get_senders()
    senders = [sender.dict() for sender in senders] 
    return {"senders": senders}

@app.get("/transactions")
def _get_transactions(email = Security(getEmail)):
    transactions = get_transactions(email)
    return {"transactions": transactions}

@app.post("/transaction/ignore")
def _ignore_transaction(request: IgnoreTransactionRequest, email = Security(getEmail)):
    ignore_transaction(request.transaction_id, email)
    return "ok"

@app.post("/transaction/unignore")
def _unignore_transaction(request: IgnoreTransactionRequest, email = Security(getEmail)):
    unignore_transaction(request.transaction_id, email)
    return "ok"

@app.post("/transaction/categorize")
def _categorize_transaction(request: CategorizeTransactionRequest, email = Security(getEmail)):
    categorize_transaction(request.transaction_id, request.category, email)
    return "ok"

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)
