from typing import List
from db import add_merchant, add_transactions_db, get_merchants, get_transaction, get_transaction_uncached, update_transaction
from models import AddTransactionReasonRequest, Category, Transaction
from fastapi import HTTPException
from mail import Mail
import logging
import re

from utils import measure_time

def ignore_transaction(transaction_id: str, email: str, manual: bool = False) -> str:
    transaction = get_transaction_uncached(email, transaction_id) if manual else get_transaction(email, transaction_id)
    if not transaction:
        raise HTTPException(status_code=400, detail="Transaction not found")
    transaction.ignore = True
    update_transaction(email, transaction.id, transaction)
    return "ok"

def unignore_transaction(transaction_id: str, email: str, manual: bool = False) -> str:
    transaction = get_transaction_uncached(email, transaction_id) if manual else get_transaction(email, transaction_id)
    if not transaction:
        raise HTTPException(status_code=400, detail="Transaction not found")
    transaction.ignore = False
    update_transaction(email, transaction.id, transaction)
    return "ok"

def add_transaction_reason(request: AddTransactionReasonRequest, email: str, manual: bool = False) -> str:
    transaction = get_transaction_uncached(email, request.transaction_id) if manual else get_transaction(email, request.transaction_id)
    if not transaction:
        raise HTTPException(status_code=400, detail="Transaction not found")
    transaction.reason = request.reason
    update_transaction(email, transaction.id, transaction)
    return "ok"

def categorize_transaction(transaction_id: str, category: Category, email: str, manual = False) -> str:
    transaction = get_transaction_uncached(email, transaction_id) if manual else get_transaction(email, transaction_id)
    if not transaction:
        raise HTTPException(status_code=400, detail="Transaction not found")
    transaction.category = category
    update_transaction(email, transaction.id, transaction)
    add_merchant(transaction.merchant, category)
    return "ok"

@measure_time
def checkMailForTransaction(transaction: Transaction):
    try:
        # Checking phonepe emails for UPI transactions
        if transaction.type == "upi":
            logging.info(f"Checking email for {transaction.merchant}")
            fromEpoch = transaction.timestamp - 120
            toEpoch = transaction.timestamp + 120
            mails = Mail().getEmailsFrom("noreply@phonepe.com", fromEpoch, toEpoch)
            if len(mails) == 0:
                logging.info("No emails found")
                transaction.emailChecked = True
            if len(mails) == 1:
                mail = mails[0]
                subjectJson = mail.parseSubject(r"Sent\s+₹\s*(?P<amount>\d+)\s+to\s+(?P<merchant>.+)")
                amount = subjectJson.get("amount", 0)
                if amount:
                    amount = int(amount)
                    if amount != transaction.amount:
                        logging.info(f"Amount mismatch, expected {transaction.amount}, got {amount}")
                        return
                pattern = re.compile(
                    r"Paid to\s+(?P<recipient>[A-Z\s]+)\s+₹\s*(?P<amount>\d+).*?"
                    r"Bank Ref\. No\.\s*:\s*(?P<ref_no>\d+).*?"
                    r"Message\s*:\s*(?P<message>\S.*?)?(?:\s+[A-Z][a-z]+|$)",
                    re.DOTALL
                )
                contentJson = mail.parseHtmlContent(pattern)
                logging.info(contentJson)
                merchant = contentJson.get("recipient")
                if merchant and merchant != transaction.merchant:
                    logging.info(f"Updating merchant from email: {merchant}")
                    transaction.merchant = merchant
                message = contentJson.get("message")
                if message:
                    transaction.message = message
                    try:
                        category = Category[message.lower()]
                        transaction.category = category
                    except KeyError:
                        pass
                transaction.emailChecked = True
            if len(mails) > 1:
                logging.info("Found multiple emails, Ignoring for now")
                transaction.emailChecked = True
                transaction.multipleMails = True
    except Exception as e:
        logging.exception(f"Error checking email for {transaction.merchant}: {str(e)}")

@measure_time
def update_category(transaction, existingtransaction=None):
    merchants = get_merchants()
    if transaction.merchant in merchants:
        category = Category(merchants[transaction.merchant]["category"])
        if category != Category.uncategorized:
            transaction.category = category
    if existingtransaction:
        if existingtransaction.emailChecked:
            transaction.emailChecked = True
    if transaction.emailChecked == False and transaction.category == Category.uncategorized:
        checkMailForTransaction(transaction)
    if transaction.category != Category.uncategorized:
        print(f"Updating category for {transaction.merchant} to {transaction.category}")

@measure_time
def add_transactions(email: str, transactions: List[Transaction]):
    if not transactions:
        return False

    transactionToAdd = []
    for transaction in transactions:
        try:
            existingtransaction = get_transaction(email, transaction.id)
            if existingtransaction:
                if existingtransaction.ignore:
                    continue
                if existingtransaction.category == Category.uncategorized:
                    update_category(transaction, existingtransaction)
                    if transaction.dict() == existingtransaction.dict():
                        continue
                    logging.info(f"Updating transaction: {existingtransaction.dict()}")
                    logging.info(f"Updating transaction: {transaction.dict()}")
                    update_transaction(email, existingtransaction.id, transaction)
            else:
                if transaction.category == Category.uncategorized:
                    update_category(transaction)
                transactionToAdd.append(transaction)
        except Exception as e:
            logging.exception(f"Error adding transaction: {transaction}: {str(e)}")

    if len(transactionToAdd) > 0:
        print(f"Adding {len(transactionToAdd)} transactions")
        add_transactions_db(email, transactionToAdd)
