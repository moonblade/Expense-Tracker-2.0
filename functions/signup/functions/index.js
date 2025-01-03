/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const path = require("path");
const express = require("express");

const app = express();

// Serve the signup page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/signup.html"));
});

// Export the function
exports.signupPage = functions.https.onRequest(app);
