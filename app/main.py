import os
from uuid import uuid4
from auth import validate_token
from typing import List
from models import AddTransactionReasonRequest, CategorizeTransactionRequest, GetTransactionRequest, IgnoreTransactionRequest, Message, Pattern, UpdateSendersRequest, Transaction
from fastapi import FastAPI, Security, HTTPException, BackgroundTasks, Depends, Path, Body, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from parser import parseMessages, extract_sms_details, executor
from db import get_emails, get_patterns, get_senders, get_transactions, is_admin, read_messages, read_sms_from_last_30_days, unprocess_message, upsert_pattern, update_senders, delete_pattern, save_sms, add_transactions_db
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from transactions import add_transaction_reason, categorize_transaction, ignore_transaction, unignore_transaction
import uvicorn
import logging
from datetime import datetime

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
@app.get("/transactionsui")
@app.get("/help")
@app.get("/patternsui")
@app.get("/messagesui")
@app.get("/sendersui")
def ui() -> str:
    return FileResponse(os.path.join("static", "expense-tracker", "index.html"))

@app.post("/processmessages")
def process_messages(email = Security(getEmail), background_tasks: BackgroundTasks = None):
    messages = read_messages(email)
    parseMessages(email, messages, background_tasks)
    return {"status": "success", "message": "Messages processed successfully"}

@app.get("/messages")
def messages(email = Security(getEmail), admin_mode: bool = False):
    if not is_admin(email):
        admin_mode = False
    messages = read_messages(email, admin_mode=admin_mode)
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
def _upsert_pattern(pattern: Pattern, email = Security(getEmail)):
    success = upsert_pattern(pattern, email)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid pattern")
    return "ok"

@app.delete("/patterns/{pattern_id}")
def _delete_pattern(pattern_id: str = Path(..., description="The ID of the pattern to delete"), email = Security(getEmail)):
    if not is_admin(email):
        raise HTTPException(status_code=403, detail="Not authorized to delete patterns")
    success = delete_pattern(pattern_id)
    if not success:
        raise HTTPException(status_code=404, detail="Pattern not found")
    return {"status": "success", "message": "Pattern deleted successfully"}

@app.post("/test-pattern")
def test_pattern(content: str = Body(..., embed=True), regex: str = Body(..., embed=True)):
    success, details = extract_sms_details(regex, content)
    return {"success": success, "details": details}

@app.get("/senders")
def _get_senders(email = Security(getEmail)):
    senders = get_senders()
    senders = [sender.dict() for sender in senders] 
    return {"senders": senders}

@app.get("/transactions")
def _get_transactions(email = Security(getEmail), transactionRequest: GetTransactionRequest = Depends()):
    transactions = get_transactions(email, transactionRequest.get_from_date(), transactionRequest.get_to_date())
    return {"transactions": transactions}

@app.post("/transaction/ignore")
def _ignore_transaction(request: IgnoreTransactionRequest, email = Security(getEmail)):
    ignore_transaction(request.transaction_id, email, manual=True)
    return "ok"

@app.post("/transaction/unignore")
def _unignore_transaction(request: IgnoreTransactionRequest, email = Security(getEmail)):
    unignore_transaction(request.transaction_id, email, manual=True)
    return "ok"

@app.post("/transaction/reason")
def _add_transaction_reason(request: AddTransactionReasonRequest, email = Security(getEmail)):
    add_transaction_reason(request, email, manual=True)
    return "ok"

@app.post("/transaction/categorize")
def _categorize_transaction(request: CategorizeTransactionRequest, email = Security(getEmail)):
    categorize_transaction(request.transaction_id, request.category, email, manual=True)
    return "ok"

@app.post("/transactions/add")
def add_transaction(transaction: Transaction = Body(...), email = Security(getEmail)):
    add_transactions_db(email, [transaction])
    return {"status": "success", "message": "Transactions added successfully"}

@app.post("/transaction/refresh")
def _refresh_transactions():
    emails = get_emails()
    for email in emails:
        logging.info(f"Running scheduled task for email: {email} at {datetime.now()}")
        messages = read_messages(email, 1)
        parseMessages(email, messages)
        logging.info(f"Finished processing messages for email: {email}")

@app.post("/sms/unprocess")
def unprocess_sms(email = Security(getEmail), sms_id= Body(..., embed=True)):
    logging.info(f"Unprocessing SMS with ID: {sms_id} for email: {email}")
    unprocess_message(email, sms_id)
    return {"status": "success", "message": "Message unprocessed successfully"}

@app.post("/sms")
def save_sms_endpoint(request: Request, email: str = Body(...), sms: str = Body(...), sender: str = Body(...), background_tasks: BackgroundTasks = None):
    id = str(uuid4())
    save_sms(email, sms, sender, id)
    message = Message(sms=sms, sender=sender, timestamp=int(datetime.now().timestamp()), id=id)
    parseMessages(email, [message], background_tasks)
    return {"status": "success", "message": "SMS saved successfully"}

@app.get("/status")
def status():
    emails = get_emails()
    hasTransactions = False
    for email in emails:
        if is_admin(email):
            # get current date in epoch
            to_date = int(datetime.now().timestamp())
            # get from date as 30 days before today
            from_date = to_date - 30 * 24 * 60 * 60
            transactions = get_transactions(email, from_date, to_date)
            if transactions:
                hasTransactions = True
                break
            
    if not hasTransactions:
        raise HTTPException(status_code=503, detail="No transactions found in the last 30 days")

    return {"status": "ok", "message": "Service is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)
