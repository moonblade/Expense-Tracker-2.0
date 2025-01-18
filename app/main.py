import os
from typing import List
from models import UpdateSendersRequest
from fastapi import FastAPI
from parser import parseMessages
from db import get_senders, read_sms_from_last_30_days, update_senders
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

origins = [
    "http://localhost",
    "http://localhost:9000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def ui() -> str:
    return FileResponse(os.path.join("static", "expense-tracker", "index.html"))

@app.get("/update")
def update():
    messages = read_sms_from_last_30_days("mnishamk@gmail.com")
    parseMessages(messages)
    return {"status": "success", "message": "Messages processed successfully"}

@app.post("/senders")
def _update_senders(updateSendersRequest: UpdateSendersRequest):
    update_senders(updateSendersRequest.senders)
    return updateSendersRequest

@app.get("/senders")
def _get_senders():
    senders = get_senders()
    senders = [sender.dict() for sender in senders] 
    return {"senders": senders}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)
