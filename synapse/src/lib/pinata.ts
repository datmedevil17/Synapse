import axios from "axios";

// Add environment variables for API keys
const PINATA_API_KEY = process.env.PINATA_API_KEY || "1ced050219057c289974";
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || "7a3b630fbbd48aef24bab6efc4302c2f8ff303ac3bfcc6f0b068e773d79de6b7";

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export const uploadToIpfs = async (file: File): Promise<string | undefined> => {
  if (!file) {
    throw new Error("No file provided");
  }

  try {
    const fileData = new FormData();
    fileData.append("file", file);
    const res = await axios.post<PinataResponse>(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      fileData,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const tokenURI = `https://ipfs.io/ipfs/${res.data.IpfsHash}`;
    console.log("File uploaded successfully:", tokenURI);
    return tokenURI;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw new Error("Failed to upload file to IPFS");
  }
};

export const uploadToIpfsJson = async (jsonData: object): Promise<string | undefined> => {
  if (!jsonData) {
    throw new Error("No JSON data provided");
  }

  try {
    const res = await axios.post<PinataResponse>(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      jsonData,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
          'Content-Type': 'application/json',
        }
      }
    );
    const tokenURI = `https://ipfs.io/ipfs/${res.data.IpfsHash}`;
    console.log("JSON uploaded successfully:", tokenURI);
    return tokenURI;
  } catch (error) {
    console.error("Error uploading JSON to IPFS:", error);
    throw new Error("Failed to upload JSON to IPFS");
  }
};

export const getJsonFromIpfs = async <T>(ipfsHash: string): Promise<T | undefined> => {
  if (!ipfsHash) {
    throw new Error("No IPFS hash provided");
  }

  try {
    const res = await axios.get<T>(ipfsHash);
    console.log("JSON fetched successfully from IPFS");
    return res.data;
  } catch (error) {
    console.error("Error fetching JSON from IPFS:", error);
    throw new Error("Failed to fetch JSON from IPFS");
  }
};