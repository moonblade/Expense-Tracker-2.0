import { getIdToken } from "./LoginContext";

// Determine the API base URL based on the environment
const API_BASE_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:9000" : "";

export const fetchSenders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/senders`);
    if (!response.ok) {
      throw new Error("Failed to fetch senders");
    }
    const data = await response.json();
    return data.senders || [];
  } catch (error) {
    console.error("Error fetching senders:", error);
    return [];
  }
};

export const updateSenderStatus = async (name, status) => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(`${API_BASE_URL}/senders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify({
        senders: [{ name, status, comparison_type: "contains" }],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update sender status");
    }

    return true;
  } catch (error) {
    console.error("Error updating sender status:", error);
    return false;
  }
};

