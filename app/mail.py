import imaplib
import datetime
import email
from email.header import decode_header
import re
import os
import webbrowser
from utils import getSecret, Config
import dateutil.parser
import logging
from bs4 import BeautifulSoup

class Email():
    def __init__(self):
        self.messageId = None
        self.senderName = None
        self.senderEmail = None
        self.subject = None
        self.date = None
        self.htmlContent = None

    def __str__(self):
        return '''From: {senderName} {senderEmail}
Subject: {subject}
Date: {date}
====
'''.format(senderName=self.senderName, senderEmail=self.senderEmail, subject=self.subject, date=self.date)

    def fixDict(self, d):
        for key, value in d.items():
            d[key] = value.strip()
        return d

    def parseSubject(self, pattern):
        if type(pattern) == str:
            pattern = re.compile(pattern)
        if not pattern:
            return {}
        match = pattern.search(self.subject)
        if match:
            return self.fixDict(match.groupdict())
        return {}

    def parseHtmlContent(self, pattern):
        if type(pattern) == str:
            pattern = re.compile(pattern)
        soup = BeautifulSoup(self.htmlContent, features="lxml")
        content = soup.get_text()
        match = pattern.search(content)
        if match:
            return self.fixDict(match.groupdict())
        return {}

class SingletonMeta(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]

class Mail(metaclass=SingletonMeta):
    def __init__(self):
        self.config = Config("mail", isSecret=True)
        self.email = self.config.get("email")
        self.password = self.config.get("password")
        self.imap =  imaplib.IMAP4_SSL("imap.gmail.com")
        self.imap.login(self.email, self.password)
        self.imap.select("INBOX")

    def getRawMessage(self, messageId):
        status, data = self.imap.fetch(messageId,'(RFC822)')
        if status != "OK":
            raise Exception("Could not fetch message with messageId", messageId)

        for response in data:
            if isinstance(response, tuple):
                message = email.message_from_bytes(response[1])
                if message.is_multipart():
                    for part in message.walk():
                        try:
                            content = part.get_payload(decode=True).decode()
                            if part.get_content_type() == "text/html":
                                messageBody = content
                                return message, messageBody
                        except:
                            pass
                            # print("Could not load multipart content")
                else:
                    if message.get_content_type() == "text/html" or message.get_content_type() == "text/plain":
                        messageBody = message.get_payload(decode=True).decode() 
                        return message, messageBody
                return message, None
        raise Exception("Could not parse email")
    
    def convertToEmail(self, messageId, rawMessage, messageBody):
        def getHeader(headerName, index):
            decodedHeader = decode_header(rawMessage.get(headerName))
            # Hacky code, maybe fine alternative
            if headerName == "From" and len(decodedHeader) == 1:
                encoding = decodedHeader[0][1]
                decodedHeader = [(part, encoding) for part in decodedHeader[0][0].split(" ")]
                if len(decodedHeader) == 1:
                    decodedHeader = [decodedHeader[0], decodedHeader[0]]
            headerValue, encoding = decodedHeader[index]
            if isinstance(headerValue, bytes):
                if (encoding):
                    headerValue = headerValue.decode(encoding).strip()
                else:
                    headerValue = headerValue.decode().strip()
            return headerValue

        emailObject = Email() 
        emailObject.messageId = messageId
        emailObject.senderName = getHeader("From", 0)
        emailObject.senderEmail = getHeader("From", 1).replace("<", "").replace(">","")
        emailObject.subject = getHeader("Subject", 0)
        emailObject.date = dateutil.parser.parse(getHeader("Date", 0))
        emailObject.htmlContent = messageBody
        return emailObject

    def getEmail(self, messageId):
        rawMessage, messageBody = self.getRawMessage(messageId)
        return self.convertToEmail(messageId, rawMessage, messageBody)

    def markCompleted(self, messageId):
        status, data = self.imap.store(messageId,'+FLAGS',self.config.get("emailProcessedFlag"))
        if status != "OK":
            raise Exception("Could not set processed flag")

    def markIncomplete(self, messageId):
        status, data = self.imap.store(messageId,'-FLAGS',self.config.get("emailProcessedFlag"))
        if status != "OK":
            raise Exception("Could not unset processed flag")

    def formatDate(self, date):
        return date.strftime("%d-%b-%Y")

    def getEmailsFrom(self, fromEmail, fromEpoch, toEpoch):
        fromDate = datetime.datetime.utcfromtimestamp(fromEpoch)
        toDate = datetime.datetime.utcfromtimestamp(toEpoch)

        if fromDate.date() == toDate.date():
            toDate += datetime.timedelta(days=1)

        # IMAP only filters by date (not time), so fetch all emails from that date range
        status, messageIds = self.imap.search(
            None, "FROM", fromEmail, 
            "SINCE", self.formatDate(fromDate), 
            "BEFORE", self.formatDate(toDate), 
            "UNKEYWORD", self.config.get("emailProcessedFlag")
        )

        if status != "OK":
            raise Exception("Could not search for messages from", fromEmail)
        
        messageIds = messageIds[0].split()
        emails = []

        for messageId in messageIds:
            emailObj = self.getEmail(messageId)

            # Manually filter by exact epoch timestamps
            if fromEpoch <= emailObj.date.timestamp() <= toEpoch:
                emails.append(emailObj)

        return emails
