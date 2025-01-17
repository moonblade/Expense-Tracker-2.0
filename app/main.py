import os
from fastapi import FastAPI
from parser import parseMessages
from db import get_senders, read_sms_from_last_30_days
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def ui() -> str:
    return FileResponse(os.path.join("static", "expense-tracker", "index.html"))

@app.get("/update")
def update():
    messages = read_sms_from_last_30_days("mnishamk@gmail.com")
    parseMessages(messages)
    return {"status": "success", "message": "Messages processed successfully"}

@app.get("/senders")
def _get_senders():
    senders = get_senders()
    senders = [sender.dict() for sender in senders] 
    return {"senders": senders}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)
