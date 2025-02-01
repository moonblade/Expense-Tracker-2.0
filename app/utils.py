import os
import json
import time
import logging


def getScriptDir():
    return os.path.dirname(os.path.realpath(__file__))

class Config():
    def __init__(self, configFileName, isSecret = False):
        if isSecret:
            configFilePath = os.path.join(getScriptDir(), ".", "secrets", configFileName + ".json")
        else:
            configFilePath = os.path.join(getScriptDir(), ".", "configs", configFileName + ".json")
        with open(configFilePath) as configFile:
            self.config = json.load(configFile)

    def getRoot(self):
        return self.config

    def get(self, configParam):
        return self.config[configParam]

def getSecret(secretName):
    secretFilePath = os.path.join(getScriptDir(), ".", "secrets", secretName)
    with open(secretFilePath) as secretFile:
        secret = secretFile.read().strip()
        return secret

def measure_time(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        execution_time = end_time - start_time
        logging.info(f"{func.__name__} took {execution_time:.4f} seconds to execute")
        return result
    return wrapper

