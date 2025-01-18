import datetime
import json
import logging
import re
from typing import List

from models import Message, MessageStatus, Sender, SenderComparisonType, SenderStatus
from db import add_sender, get_senders, update_message_status


reject_keywords = []
regexes = []

def extract_sms_details(regex: str, sms: str) -> dict:
    """
    Extracts details from an SMS string based on the given regex.
    
    Args:
        regex (str): The regular expression with named capture groups.
        sms (str): The SMS string to parse.
        
    Returns:
        dict: A dictionary with capture groups as keys and matched values.
              Returns an empty dictionary if no match is found.
    """
    match = re.search(regex, sms)
    if match:
        return match.groupdict()
    return {}

def reject(email: str, messages: List[Message]):
    if not messages:
        return

    for message in messages:
        message.status = MessageStatus.rejected

    logging.info(f"Rejecting {len(messages)} messages")
    update_message_status(email, messages)

def parseMessages(email: str, messages: List[Message]):
    rejected = []
    for message in messages:
        sender = message.sender
        if not sender:
            if message.status != MessageStatus.rejected:
                logging.info(f"Rejecting message with no sender: {message}")
                rejected.append(message)
            continue
        if not isValidSender(sender):
            if message.status != MessageStatus.rejected:
                rejected.append(message)
            continue
        sms = message.sms
        if not isValidSms(sms):
            if message.status != MessageStatus.rejected:
                rejected.append(message)
            continue
        timestamp = message.timestamp
        for regex in regexes:
            details = extract_sms_details(regex["regex"], sms)
            if details:
                message["matched"] = True
                print(json.dumps(details, indent=2))
                break
    reject(email, rejected)

def isValidSms(sms):
    return True

def isValidSender(sender: str):
    senders = get_senders()
    if "-" not in sender:
        return False
    for senderItem in senders:
        if senderItem.comparison_type == SenderComparisonType.contains:
            if senderItem.name in sender:
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
