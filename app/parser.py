from concurrent.futures import ThreadPoolExecutor
import datetime
import json
import hashlib
import logging
import re
from typing import List

from models import Message, MessageStatus, PatternAction, Sender, SenderComparisonType, SenderStatus, Transaction
from db import add_sender, get_patterns, get_senders, update_message_status
from transactions import add_transactions


reject_keywords = []
regexes = []
executor = ThreadPoolExecutor()

def extract_sms_details(regex: str, sms: str):
    """
    Extracts details from an SMS string based on the given regex.
    
    Args:
        regex (str): The regular expression with named capture groups.
        sms (str): The SMS string to parse.
        
    Returns:
        dict: A dictionary with capture groups as keys and matched values.
              Returns an empty dictionary if no match is found.
    """
    try:
        match = re.search(regex, sms)
        if match:
            return True, match.groupdict()
        return False, {}
    except re.error as e:
        logging.error(f"Regex error: {e} for regex: {regex}")
        return False, {}

def reject(email: str, messages: List[Message]):
    if not messages:
        return

    for message in messages:
        message.status = MessageStatus.rejected

    logging.info(f"Rejecting {len(messages)} messages")
    update_message_status(email, messages)

def set_matched(email: str, messages: List[Message]):
    if not messages:
        return

    for message in messages:
        message.status = MessageStatus.matched

    logging.info(f"Matching {len(messages)} messages")
    update_message_status(email, messages)

def parseMessages(email: str, messages: List[Message], backgroundTasks=None):
    rejected = []
    matched = []
    transactions = []
    hashes = set()
    for message in messages:
        sender = message.sender
        sms = message.sms
        hash = hashlib.md5(sms.encode()).hexdigest()
        if not sender:
            if message.status != MessageStatus.rejected:
                logging.info(f"Rejecting message with no sender: {message}")
                rejected.append(message)
            continue
        if not isValidSender(sender):
            if message.status != MessageStatus.rejected:
                rejected.append(message)
            continue
        if hash in hashes:
            logging.info(f"Rejecting duplicate message: {message.sms}")
            rejected.append(message)
            continue
        hashes.add(hash)
        timestamp = message.timestamp
        success, status, pattern, transaction = parseMessage(message)
        if success:
            message.status = status
            if pattern:
                message.matchedPattern = pattern.id
            if status == MessageStatus.matched:
                if transaction is not None and pattern and pattern.metadata:
                    transaction = {**transaction, **pattern.metadata, "timestamp": timestamp, "id": message.id}
                    try:
                        transaction = Transaction.from_json(transaction)
                    except ValueError:
                        logging.exception(f"Error parsing transaction: {transaction} with message {message}")
                        continue
                matched.append(message)
                if transaction:
                    transactions.append(transaction)
                else:
                    logging.info(f"Matched message but no transaction: {message}")
            else:
                rejected.append(message)
        else:
            message.status = MessageStatus.unprocessed
    reject(email, rejected)
    set_matched(email, matched)
    if backgroundTasks:
        backgroundTasks.add_task(add_transactions, email, transactions)
    else:
        executor.submit(add_transactions, email, transactions)

def parseMessage(message: Message):
    patterns = get_patterns()
    for pattern in patterns:
        if pattern.sender.lower() in message.sender.lower():
            success, details = extract_sms_details(pattern.pattern, message.sms)
            if success:
                if pattern.action == PatternAction.approve:
                    return True, MessageStatus.matched, pattern, details
                else:
                    return True, MessageStatus.rejected, pattern, None
    return False, MessageStatus.unprocessed, None, None

def isValidSender(sender: str):
    senders = get_senders()
    if "-" not in sender:
        return False
    for senderItem in senders:
        if senderItem.comparison_type == SenderComparisonType.contains:
            if senderItem.name.lower() in sender.lower():
                if senderItem.status == SenderStatus.approved:
                    return True
                elif senderItem.status == SenderStatus.unprocessed:
                    return True
                else:
                    return False
    name = sender.split("-")[1]
    senderObject = Sender(name=name)
    add_sender(senderObject)
    return False
