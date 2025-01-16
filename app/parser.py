import datetime
import json
import re

regexes = [{
    "regex": r"ICICI Bank Acct (?P<account_no>\w+) debited for Rs (?P<amount>\d+\.\d{2}) on (?P<date>\d{2}-[A-Za-z]{3}-\d{2}); (?P<credited_to>.+?) credited\. UPI:(?P<upi_id>\d+)\. Call (?P<dispute_number>\d+) for dispute\. SMS BLOCK (?P<block_code>\w+) to (?P<block_number>\d+)\.",
    "tag": "icici_bank"
}]

reject_keywords = [
    "is OTP for txn of INR"
]

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

def parseMessages(messages):
    for message in messages:
        sender = message.get("sender", "")
        if not sender:
            continue
        if not isValidSender(sender):
            continue
        sms = message.get("sms", "")
        if not isValidSms(sms):
            continue
        timestamp = message.get("timestamp", 0)
        for regex in regexes:
            details = extract_sms_details(regex["regex"], sms)
            if details:
                message["matched"] = True
                # print(json.dumps(details, indent=2))
                break

        if not message.get("matched"):
            print("REGEX NOT MATCHED")
            print(sms)
            # print timestamp in iso 8601 format
            print(f"Timestamp: {datetime.datetime.fromtimestamp(timestamp).isoformat()}")
        # print(f"SMS: {message['sms']}")
        # print(f"Sender: {message['sender']}")
        # print(f"Timestamp: {message['timestamp']}")

def isValidSms(sms):
    for keyword in reject_keywords:
        if keyword in sms:
            return False
    return True

def isValidSender(sender):
    # icici bank
    if "ICICI" in sender:
        return True
    return False
    return True
