from enum import Enum
from pydantic import BaseModel

class SenderStatus(str, Enum):
    approved = "approved"
    rejected = "rejected"
    unprocessed = "unprocessed"

class SenderComparisonType(str, Enum):
    contains = "contains"

class Sender(BaseModel):
    name: str = ""
    status: SenderStatus = SenderStatus.unprocessed
    comparison_type: SenderComparisonType = SenderComparisonType.contains
