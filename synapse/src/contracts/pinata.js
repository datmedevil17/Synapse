import axios from "axios";
export const uploadToIpfs = async (file) => {
    if (file) {
      try {
        const fileData = new FormData();
        fileData.append("file", file);
        const res = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          fileData,
          {
            headers: {
              pinata_api_key: "1ced050219057c289974",
              pinata_secret_api_key: "7a3b630fbbd48aef24bab6efc4302c2f8ff303ac3bfcc6f0b068e773d79de6b7",
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const tokenURI = `https://ipfs.io/ipfs/${res.data.IpfsHash}`;
        console.log(tokenURI)
        return tokenURI;
      } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("Error uploading file to IPFS");
      }
    }
  };

  export const uploadToIpfsJson = async (jsonData) => {
    if(jsonData){
      try{
        const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS',jsonData,{
          headers:{
            pinata_api_key: "1ced050219057c289974",
            pinata_secret_api_key: "7a3b630fbbd48aef24bab6efc4302c2f8ff303ac3bfcc6f0b068e773d79de6b7",
            'Content-Type': 'application/json',
          }
        })
        const tokenURI = `https://ipfs.io/ipfs/${res.data.IpfsHash}`;
        console.log(tokenURI)
        return tokenURI;
      }
      catch(e){
        console.log("Error uploading JSON:", e)
        throw new Error("Error uploading JSON to IPFS")
      }
    }
  }

  export const getJsonFromIpfs = async (ipfsHash) => {
    if(ipfsHash){
      try{
        const res = await axios.get(ipfsHash);
        const jsonData = res.data;
        console.log(jsonData)
        return jsonData;
      }
      catch(e){
        console.log("Error fetching JSON:", e)
        throw new Error("Error fetching JSON from IPFS")
      }
    }
  }