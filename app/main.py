from db import read_sms_from_last_30_days
import json


messages = read_sms_from_last_30_days("mnishamk@gmail.com")
print(json.dumps(messages, indent=2))
