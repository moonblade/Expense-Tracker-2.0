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
    matchedPattern: str = ""

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

class TransactionType(str, Enum):
    debit = "debit"
    credit = "credit"

class Category(str, Enum):
    uncategorized = "uncategorized"
    travel = "travel"
    family = "family"
    food = "food"
    friends = "friends"
    health = "health"
    home = "home"
    charity = "charity"
    shopping = "shopping"
    investment = "investment"
    entertainment = "entertainment"

class Transaction(BaseModel):
    id: str = ""
    amount: float = 0
    account: str = ""
    timestamp: int = 0
    merchant: str = ""
    date: str = ""
    balance: float = 0
    ignore: bool = False
    type: str = ""
    transactiontype: TransactionType = TransactionType.debit
    category: Category = Category.uncategorized
    emailChecked: bool = False
    multipleMails: bool = False
    message: str = ""
    reason: str = ""

    @staticmethod
    def from_json(transaction: Dict):
        if "amount" in transaction:
            transaction["amount"] = transaction["amount"].replace(",", "")
            transaction["amount"] = float(transaction["amount"])
        if "balance" in transaction:
            transaction["balance"] = transaction["balance"].replace(",", "")
            transaction["balance"] = float(transaction["balance"])
        return Transaction(**transaction)

class IgnoreTransactionRequest(BaseModel):
    transaction_id: str

class AddTransactionReasonRequest(BaseModel):
    transaction_id: str
    reason: str

class CategorizeTransactionRequest(BaseModel):
    transaction_id: str
    category: Category

class GetTransactionRequest(BaseModel):
    from_date: int = 0
    to_date: int = 0
