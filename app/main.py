from fastapi import FastAPI
from parser import parseMessages
from db import read_sms_from_last_30_days

app = FastAPI()

@app.get("/update")
def update():
    messages = read_sms_from_last_30_days("mnishamk@gmail.com")
    parseMessages(messages)
    return {"status": "success", "message": "Messages processed successfully"}
