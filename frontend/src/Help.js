import React from "react";
import ReactMarkdown from "react-markdown";
import {
  Box,
  Container,
} from "@mui/material";
import LoginContext from "./LoginContext";

const Help = () => {
  const { user } = React.useContext(LoginContext);

  const HELP_CONTENT = `

# IMPORTANT NOTICE:
This sends your sms to my system, since ios doesn't allow you to read sms easily.
What this does is send all the sms that comes to your phone to this system.
Then any patterns that are known are used to classify the sms as accepted, or rejected.
The accepted messages would have an amount and a merchant where the money was sent to.

## 📲 Expense Tracker iOS Setup Guide

This guide will walk you through setting up the Expense Tracker on your iOS device using the **Shortcuts** app.
After setup, your SMS messages will automatically be sent to the Expense Tracker backend for logging and analysis.

You will need:
- An iPhone with the **Shortcuts** app installed (default on iOS)

---

## 🚀 Step-by-Step Setup

### 1. Open the Shortcuts App

1. Open the built-in **Shortcuts** app on your iPhone.
2. Navigate to the **Automation** tab at the bottom.
3. Tap **+** in the top-right corner to create a new automation.

---

### 2. Create a New Automation

1. Tap **Create Personal Automation**.
2. Scroll down and choose **Message**.
3. Under “When”, select:
   - **Message Contains:** then type a single letter like 'e'
     > ⚠️ iOS does **not** currently allow triggering on *all* messages, so using a common letter like 'e' increases the chances of capturing most messages.

4. Tap **Next**.

---

### 3. Add the Webhook Action

1. Tap **New blank automation**.
2. Search for **Get Contents of URL** in search actions and select it.
3. Configure the action as follows (Use > icon to expand):
   - **URL:** Tap the URL and add the value \`https://expense.moonblade.work/sms\` in it
   - **Method:** \`POST\`
   - **Request Body:** \`Json\`
   - Tap **Add new field** of type text, fill one of the following each time. Important: Keep everything small letters:
     - **Key:** \`sms\`  
       **Text:** Tap the text area, then select **Shortcut input from the top or from the select variable list in the bottom**. The click **shortcut input** again on the text area, then → choose **Message**
     - **Key:** \`email\`  
       **Text:** ${user.email || "Your gmail address"}
     - **Key:** \`sender\`  
       **Text:** Tap **Variable**, then choose **Sender**
4. Tap **Done**.
5. Done button might not close the window, thats fine, go back enough to list of automations.

---

### 4. Disable Confirmation

1. Select the automation that you just made. In **automation**, Choose the option, \`Run Immediately\` instead of\`Run after confirmation\`
1. Turn off **Ask Before Running**.
2. Tap **Don’t Ask** to confirm.
3. Tap **Done**.

---

## ✅ Verify the Setup

1. Send someone 1rs on upi.
4. Navigate to the **Messages** tab.
5. You should see the sms with the 1 Rs transaction listed there.

---

## 📌 Notes

- You can only set automations to trigger based on messages containing specific text. Using a common letter like 'e' helps ensure most transactional messages are captured.
- This is a privacy-first tool: the data you send is only tied to your email and accessible via your login at the dashboard.
- For best results, make sure your bank/UPI alerts contain identifiable amounts and senders.

---

## 🛠️ Troubleshooting

- **Automation not triggering?** Make sure the test SMS includes the trigger letter ('e') and is received while the device is unlocked.
- **Not seeing messages on the website?** Double-check that the correct **Gmail email address** is used in the 'email' field and that the automation is turned on.
- **Using Dual SIM?** Ensure your transactional messages are received by the number configured on your iPhone.

## 🧪 After Setup: Handling Unrecognized Messages

Once your automation is running, some messages may appear in the **Messages** tab at [https://expense.moonblade.work](https://expense.moonblade.work) but are **not marked green (Accepted)**. These are messages that the system couldn’t automatically classify into a transaction.

Follow these steps to help the system learn:

### 🟡 Step 1: Open the Message

- Tap on any unaccepted (not green) message.
- This will open the **Pattern Editor** for that specific SMS.

### ✨ Step 2: Select Approve or Reject

- For messages that have a payment amount, tap the **Approve** button.
- If the message is not a valid transaction, tap **Reject**.

### ✅ Step 3: For approval

- Tap the amount in the message to select it.
- Tap Payee button.
- Tap the payee in the message to select it.

### 🛠️ Step 4: For approval and Rejection

- Tap Wildcard
- Tap all parts of the message that will change every message, so that the pattern is generic

### 🧪 Step 5: Test the Pattern

- Tap the Tick icon to test the pattern.

### 💾 Step 6: Save the Pattern

- Once the test succeeds, click **Save**.
- The pattern will now be applied automatically to similar messages in the future.

> ⚠️ Note: **Credit transaction patterns are currently not supported**. Only debit messages can be added and tracked.


  `;

  return (
    <Container>
      <Box my={4}>
        <ReactMarkdown>{HELP_CONTENT}</ReactMarkdown>
      </Box>
    </Container>
  );
};

export default Help;

