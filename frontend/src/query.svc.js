import { getIdToken } from "./LoginContext";

// Determine the API base URL based on the environment
const API_BASE_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:9000" : "";

export const fetchSenders = async () => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(`${API_BASE_URL}/senders`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      }
    });
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

export const fetchMessages = async () => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(`${API_BASE_URL}/messages`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { messages: [] };
  }
};

export const processMessages = async () => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(`${API_BASE_URL}/processmessages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to process messages");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error processing messages:", error);
    return { success: false, error: error.message };
  }
};

export const fetchPatterns = async () => {
  try {
    const idToken = await getIdToken(); // Assumes getIdToken is defined elsewhere for authentication
    const response = await fetch(`${API_BASE_URL}/patterns`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch patterns");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching patterns:", error);
    return [];
  }
};

export const updatePattern = async (pattern) => {
  try {
    const idToken = await getIdToken(); // Assumes getIdToken is defined elsewhere for authentication
    const response = await fetch(`${API_BASE_URL}/patterns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(pattern),
    });
    if (!response.ok) {
      throw new Error("Failed to update pattern");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating pattern:", error);
    throw error; // Re-throwing the error so that it can be handled where the function is called
  }
};
