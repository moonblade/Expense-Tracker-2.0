from enum import Enum
from typing import Dict, List
from pydantic import BaseModel

class SenderStatus(str, Enum):
    approved = "approved"
    rejected = "rejected"
    unprocessed = "unprocessed"

class MessageStatus(str, Enum):
    matched = "matched"
    unprocessed = "unprocessed"
    rejected = "rejected"

class Message(BaseModel):
    id: str = ""
    sender: str = ""
    sms: str = ""
    timestamp: int = 0
    status: MessageStatus = MessageStatus.unprocessed

class SenderComparisonType(str, Enum):
    contains = "contains"

class Sender(BaseModel):
    id: str = ""
    name: str = ""
    status: SenderStatus = SenderStatus.unprocessed
    comparison_type: SenderComparisonType = SenderComparisonType.contains

class UpdateSendersRequest(BaseModel):
    senders: List[Sender]

class PatternAction(str, Enum):
    approve = "approve"
    reject = "reject"

class Pattern(BaseModel):
    id: str = ""
    name: str = ""
    pattern: str = ""
    sender: str = ""
    metadata: Dict[str, str] = {}
    action: PatternAction = PatternAction.approve
