'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  createCustomBot,
  getAgent,
  getCustomBotPrice,
  getNextTokenId,
} from '@/contracts/function'
import { useConfig } from 'wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'
import { parseEther } from 'viem'
import { getJsonFromIpfs, uploadToIpfsJson } from '@/lib/pinata'

export default function CreateCustom() {
  const [name, setName] = useState('') // Added name state
  const [prompt, setPrompt] = useState('')
  const [price, setPrice] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const config = useConfig()

  interface Agent {
    id?: number
    name?: string
    description?: string
    isCustom?: boolean
    memories?: string[]
    languages?: string[]
    prompt: string
    price?: number
    owner?: `0x${string}`
  }

  interface AgentData {
    name: string
    prompt: string
  }

  const [agentsData, setAgentsData] = useState<Agent[]>([])

  const fetchAgents = async () => {
    try {
      const totalAgents = await getNextTokenId()
      let agentsData: Agent[] = []
      const n = Number(totalAgents)
      for (let i = 0; i < n; i++) {
        const agent = await getAgent(i)
        const typedAgent: Agent = agent as Agent
        if (typedAgent.isCustom) {
          const url = typedAgent.prompt
          const obj = await getJsonFromIpfs(url)
          const { name, prompt } = obj as AgentData
          typedAgent.id = i
          typedAgent.prompt = prompt
          typedAgent.name = name
          typedAgent.price = Number(await getCustomBotPrice(i))
          agentsData.push(typedAgent)
        }
      }
      console.log('Agents:', agentsData)
      if (agentsData.length > 0) {
        setAgentsData(agentsData)
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!name.trim()) {
      toast.info('Please enter a name for your agent')
      return
    }

    if (!prompt.trim()) {
      toast.info('Please enter a prompt')
      return
    }

    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      toast.info('Please enter a valid price')
      return
    }

    setIsLoading(true)

    try {
      // Convert price to the format your contract expects (e.g., from ETH to wei)
      const priceInWei = parseEther(price)
      const url = await uploadToIpfsJson({name, prompt})
      const txr = await createCustomBot(url, priceInWei) // Update this line if your function signature is different
      // Wait for transaction confirmation
      await waitForTransactionReceipt(config, {
        hash: txr,
      })

      toast.success('Custom agent created successfully!')

      // Reset form after successful creation
      setName('')
      setPrompt('')
      setPrice('')
    } catch (error) {
      console.error('Error creating custom agent:', error)
      toast.error('Failed to create custom agent')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-2xl'>
      <h1 className='text-3xl font-bold mb-6 text-center'>
        Create Custom Agent
      </h1>

      <form
        onSubmit={handleSubmit}
        className='space-y-6 bg-gray-50 p-6 rounded-lg shadow-md text-black'>
        {/* Name Input */}
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700 mb-1'>
            Agent Name
          </label>
          <input
            type='text'
            id='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='My Custom Agent'
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            required
            disabled={isLoading}
          />
          <p className='text-xs text-gray-500 mt-1'>
            Enter a descriptive name for your custom agent.
          </p>
        </div>

        {/* Prompt Input */}
        <div>
          <label
            htmlFor='prompt'
            className='block text-sm font-medium text-gray-700 mb-1'>
            Prompt
          </label>
          <textarea
            id='prompt'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            placeholder='Enter the custom instructions for your AI agent...'
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            required
            disabled={isLoading}></textarea>
          <p className='text-xs text-gray-500 mt-1'>
            Be specific about how your agent should behave and respond.
          </p>
        </div>

        {/* Price Input */}
        <div>
          <label
            htmlFor='price'
            className='block text-sm font-medium text-gray-700 mb-1'>
            Price (ETH)
          </label>
          <div className='relative rounded-md shadow-sm'>
            <input
              type='number'
              id='price'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step='0.001'
              min='0'
              placeholder='0.05'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 pl-7'
              required
              disabled={isLoading}
            />
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <span className='text-gray-500 sm:text-sm'>Ξ</span>
            </div>
          </div>
          <p className='text-xs text-gray-500 mt-1'>
            This is the price users will pay to use your custom agent.
          </p>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type='submit'
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
              ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <svg
                  className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                Creating Agent...
              </div>
            ) : (
              'Create Custom Agent'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
