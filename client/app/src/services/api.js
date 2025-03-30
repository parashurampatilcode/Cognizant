import axios from "axios";

const API_URL = "http://localhost:5000/pdp"; // Replace with your backend API URL if different

const getPDPData = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching PDP data:", error);
    throw error;
  }
};

const createPDPRecord = async (pdpData) => {
  try {
    const response = await axios.post(API_URL, pdpData);
    return response.data;
  } catch (error) {
    console.error("Error creating PDP record:", error);
    throw error;
  }
};

export { getPDPData, createPDPRecord };
