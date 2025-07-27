# Expense Manager v2.0

This is a new version of the expense manager app I had earlier. The previous one was working by snooping into my emails.
But indian standards being what they are, not all transactions are sent to email, which is a travesty, having in inconsistent notification method.
SMS seems to be much more consistent, but reading sms data is not straight forward whatsoever in iOS.

### System

#### Infrastructure

- Firestore

    Data storage is in gcp firestore.

- Firebase auth

    Authenticate users with simple email and password

- Firebase cloud functions

    Validate email and password and save sms data to firestore.

- iOS shortcut

    SMS data is read by an ios shortcut and sent to a firebase cloud function.

### Log

- 2025-01-02
    - Added firebase cloud function that takes email and password, sms and sender and saves it to firestore
    - Created an ios shortcut that calls this http function every time a new sms is received

- 2025-01-16
    - Added client code to read data from firestore and parse any ICICI bank transactions

- 2025-01-17
    - Created dockerfile to build and run it as fastapi
    - Created a react frontend component after a false start with basic html js. The react app now has google login and a dark/light theme.
    ![](https://i.imgur.com/EkMXPq2.png)

- 2025-01-18
    - Added page for patterns and messages, when message is clicked, it opens dialog to add/edit the pattern.
    - Added senders page to reject senders that are not needed.

- 2025-01-25
    - Added transactions whenever refresh is done

- 2025-01-26
    - Adding a transactions page, with ignore/unignore and categorize buttons.

- 2025-07-27
    - Added new categories page for custom categories

![categories2](https://github.com/user-attachments/assets/15d4edd5-e9bf-4ee6-b69f-74396256b881)

![categories1](https://github.com/user-attachments/assets/cc4f6309-79a5-4f7a-9931-9f147176e6a2)

