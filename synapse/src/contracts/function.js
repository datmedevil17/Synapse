import { writeContract, readContract } from '@wagmi/core'
import { contractABI, contractAddress } from "./contract"
import { config } from '@/lib/wagmi'

// Create Profile
export async function createProfile(username, email) {
  const result = await writeContract(config, {
    address: contractAddress,
    abi: contractABI,
    functionName: 'createProfile',
    args: [username, email],
  })
  return result
}

// Create Agent
export async function createAgent(name, memories, languages, description) {
  const result = await writeContract(config, {
    address: contractAddress,
    abi: contractABI,
    functionName: 'createAgent',
    args: [name, memories, languages, description],
  })
  return result
}

// Create Custom Bot
export async function createCustomBot(prompt, price) {
  const result = await writeContract(config, {
    address: contractAddress,
    abi: contractABI,
    functionName: 'createCustomBot',
    args: [prompt, price],
  })
  return result
}

// Read Functions
export async function getProfile(address) {
  const result = await readContract(config, {
    address: contractAddress,
    abi: contractABI,
    functionName: 'getProfile',
    args: [address],
  })
  return result
}

export async function getAgent(tokenId) {
  const result = await readContract(config, {
    address: contractAddress, 
    abi: contractABI,
    functionName: 'getAgent',
    args: [tokenId],
  })
  return result
}

export async function getAllUserAgents(address) {
  const result = await readContract(config, {
    address: contractAddress,
    abi: contractABI, 
    functionName: 'getAllUserAgents',
    args: [address],
  })
  return result
}