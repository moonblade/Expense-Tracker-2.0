from typing import List
from db import add_merchant, add_transactions_db, get_merchants, get_transaction, update_transaction
from models import Category, Transaction
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

def categorize_transaction(transaction_id: str, category: Category, email: str) -> str:
    transaction = get_transaction(email, transaction_id)
    if not transaction:
        raise HTTPException(status_code=400, detail="Transaction not found")
    transaction.category = category
    add_merchant(transaction.merchant, category)
    update_transaction(email, transaction.id, transaction)
    return "ok"

def add_transactions(email: str, transactions: List[Transaction]):
    if not transactions:
        return False
    print(f"Adding {len(transactions)} transactions")

    transactionToAdd = []
    for transaction in transactions:
        existingtransaction = get_transaction(email, transaction.id)
        if existingtransaction:
            if existingtransaction.category == Category.uncategorized:
                merchants = get_merchants()
                if existingtransaction.merchant in merchants:
                    category = Category(merchants[existingtransaction.merchant]["category"])
                    existingtransaction.category = category
                    print(f"Updating category for {existingtransaction.merchant} to {category}")
                    update_transaction(email, existingtransaction.id, existingtransaction)
        else:
            if transaction.category == Category.uncategorized:
                merchants = get_merchants()
                if transaction.merchant in merchants:
                    category = Category(merchants[transaction.merchant]["category"])
                    print(f"Updating category for {transaction.merchant} to {category}")
                    transaction.category = category
            transactionToAdd.append(transaction)

    add_transactions_db(email, transactionToAdd)
