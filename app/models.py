from enum import Enum
from typing import List
from pydantic import BaseModel

class SenderStatus(str, Enum):
    approved = "approved"
    rejected = "rejected"
    ignored = "ignored"
    unprocessed = "unprocessed"

class MessageStatus(str, Enum):
    matched = "matched"
    unprocessed = "unprocessed"
    rejected = "rejected"

class Message(BaseModel):
    sender: str = ""
    sms: str = ""
    timestamp: int = 0
    status: MessageStatus = MessageStatus.unprocessed

class SenderComparisonType(str, Enum):
    contains = "contains"

class Sender(BaseModel):
    name: str = ""
    status: SenderStatus = SenderStatus.unprocessed
    comparison_type: SenderComparisonType = SenderComparisonType.contains

class UpdateSendersRequest(BaseModel):
    senders: List[Sender]
