from typing import List
from db import get_transaction, update_transaction
from models import Transaction
from fastapi import HTTPException

def ignore_transaction(transaction_id: str, email: str) -> str:
    transaction = get_transaction(email, transaction_id)
    if not transaction:
        raise HTTPException(status_code=400, detail="Transaction not found")
    transaction.ignore = True
    update_transaction(email, transaction.id, transaction)
    return "ok"

def unignore_transaction(transaction_id: str, email: str) -> str:
    transaction = get_transaction(email, transaction_id)
    if not transaction:
        raise HTTPException(status_code=400, detail="Transaction not found")
    transaction.ignore = False
    update_transaction(email, transaction.id, transaction)
    return "ok"

