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

export const deletePattern = async (patternId) => {
  try {
    const idToken = await getIdToken(); // Assumes getIdToken is defined elsewhere for authentication
    const response = await fetch(`${API_BASE_URL}/patterns/${patternId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete pattern");
    }
    return "ok";
  } catch (error) {
    console.error("Error deleting pattern:", error);
    throw error;
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

export const fetchMessages = async (adminMode) => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(`${API_BASE_URL}/messages?admin_mode=${adminMode}`, {
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

export const fetchTransactions = async (fromDate, toDate) => {
  try {
    const idToken = await getIdToken(); // Assumes getIdToken is defined elsewhere for authentication
    const queryString = new URLSearchParams({
      from_date: fromDate,
      to_date: toDate,
    }).toString();

    const url = `${API_BASE_URL}/transactions?${queryString}`;
    const response = await fetch(url, {
      params: {
        from_date: fromDate,
        to_date: toDate,
      },
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

export const ignoreTransaction = async (transactionId) => {
  try {
    const idToken = await getIdToken(); // Assumes getIdToken is defined elsewhere for authentication
    const response = await fetch(`${API_BASE_URL}/transaction/ignore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ transaction_id: transactionId }),
    });

    if (!response.ok) {
      throw new Error("Failed to ignore transaction");
    }
    return "ok";
  } catch (error) {
    console.error("Error ignoring transaction:", error);
    throw error;
  }
};

export const unignoreTransaction = async (transactionId) => {
  try {
    const idToken = await getIdToken(); // Assumes getIdToken is defined elsewhere for authentication
    const response = await fetch(`${API_BASE_URL}/transaction/unignore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ transaction_id: transactionId }),
    });

    if (!response.ok) {
      throw new Error("Failed to unignore transaction");
    }
    return "ok";
  } catch (error) {
    console.error("Error unignoring transaction:", error);
    throw error;
  }
};

export const categorizeTransaction = async (transactionId, category) => {
  try {
    const idToken = await getIdToken(); // Assumes getIdToken is defined elsewhere for authentication
    const response = await fetch(`${API_BASE_URL}/transaction/categorize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ 
        transaction_id: transactionId, 
        category 
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to categorize transaction");
    }
    return "ok";
  } catch (error) {
    console.error("Error categorizing transaction:", error);
    throw error;
  }
};

export const addTransactionReason = async (transactionId, reason) => {
  try {
    const idToken = await getIdToken(); // Assumes getIdToken is defined elsewhere for authentication
    const response = await fetch(`${API_BASE_URL}/transaction/reason`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ transaction_id: transactionId, reason }),
    });

    if (!response.ok) {
      throw new Error("Failed to add transaction reason");
    }
    return "ok";
  } catch (error) {
    console.error("Error adding transaction reason:", error);
    throw error;
  }
};

export const addTransaction = async (transaction) => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(`${API_BASE_URL}/transactions/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      throw new Error("Failed to add transaction");
    }

    return "ok";
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
};

export const testPattern = async (content, regex) => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(`${API_BASE_URL}/test-pattern`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ content, regex }),
    });

    if (!response.ok) {
      throw new Error("Failed to test pattern");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error testing pattern:", error);
    return { success: false, details: error.message };
  }
};

 export const unprocessSms = async (smsId) => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(`${API_BASE_URL}/sms/unprocess`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ sms_id: smsId }),
    });

    if (!response.status === 200) {
      throw new Error("Failed to unprocess SMS");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error unprocessing SMS:", error);
    throw error;
  }
}

export const fetchCategories = async () => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(`${API_BASE_URL}/category`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export const upsertCategory = async (categoryEntry) => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(`${API_BASE_URL}/category`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': "application/json",
      },
      body: JSON.stringify(categoryEntry),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export const deleteCategory = async (categoryName) => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(`${API_BASE_URL}/category/${encodeURIComponent(categoryName)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete category");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }
};
