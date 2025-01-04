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

### ChangeLog

> 2025-01-02

    - Added firebase cloud function that takes email and password, sms and sender and saves it to firestore
    - Created an ios shortcut that calls this http function every time a new sms is received
