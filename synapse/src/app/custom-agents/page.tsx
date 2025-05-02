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
import { formatEther, parseEther } from 'viem'
import { getJsonFromIpfs, uploadToIpfsJson } from '@/lib/pinata'
import Link from 'next/link'

export default function CreateCustom() {
  const [name, setName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [price, setPrice] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const config = useConfig()

  interface CustomAgent {
    id?: number
    name: string
    description: string
    isCustom: boolean
    memories: string[]
    languages: string[]
    price?: number
  }

  interface AgentData {
    name: string
    prompt: string
  }

  const [agentsData, setAgentsData] = useState<CustomAgent[]>([])

  const fetchAgents = async () => {
    setIsDataLoading(true)
    try {
      const totalAgents = await getNextTokenId()
      let agentsData: CustomAgent[] = []
      const n = Number(totalAgents)
      for (let i = 0; i < n; i++) {
        const agent = await getAgent(i)
        const typedAgent: CustomAgent = agent as CustomAgent
        if (typedAgent.isCustom) {
          const url = typedAgent.name
          const obj = await getJsonFromIpfs(url)
          const { name, prompt } = obj as { name: string; prompt: string }
          typedAgent.id = i
          typedAgent.description = prompt
          typedAgent.name = name
          typedAgent.price = Number(formatEther((await getCustomBotPrice(i)) as bigint))
          agentsData.push(typedAgent)
          console.log('Agent:', typedAgent)
        }
      }
      setAgentsData(agentsData)
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast.error('Failed to load custom agents')
    } finally {
      setIsDataLoading(false)
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
      const priceInWei = parseEther(price)
      const url = await uploadToIpfsJson({ name, prompt })
      const txr = await createCustomBot(url, priceInWei)
      await waitForTransactionReceipt(config, {
        hash: txr,
      })
      toast.success('Custom agent created successfully!')
      setName('')
      setPrompt('')
      setPrice('')

      // Refresh the agents list after creating a new one
      fetchAgents()
    } catch (error) {
      console.error('Error creating custom agent:', error)
      toast.error('Failed to create custom agent')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6 text-center'>Custom Agents</h1>

      {/* Custom Agents Display Section */}
      <div className='mb-12'>
        <h2 className='text-2xl font-semibold mb-4'>Available Custom Agents</h2>

        {isDataLoading ? (
          <div className='flex justify-center items-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
          </div>
        ) : agentsData.length === 0 ? (
          <div className='bg-gray-800 rounded-lg p-6 text-center'>
            <p className='text-gray-300'>
              No custom agents available yet. Create one below!
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {agentsData.map((agent, index) => (
              <Link
                href={`/agents/${agent.id}`}
                key={index}
                className='block transition-transform hover:scale-105 hover:shadow-lg'>
                <div className='bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 h-full'>
                  <div className='flex justify-between items-start mb-2'>
                    <h3 className='text-xl font-bold text-white'>
                      {agent.name}
                    </h3>
                    <span className='px-2 py-1 bg-purple-600 text-white text-xs rounded-full'>
                      {agent.price} ETH
                    </span>
                  </div>
                  <p className='text-gray-300 mb-4 line-clamp-3'>
                    {agent.description}
                  </p>
                  <div className='mt-auto pt-2 border-t border-gray-700'>
                    <span className='text-xs text-gray-400'>
                      Premium Custom Agent
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Custom Agent Form */}
      <div className='max-w-2xl mx-auto'>
        <h2 className='text-2xl font-semibold mb-4'>Create New Custom Agent</h2>

        <form
          onSubmit={handleSubmit}
          className='space-y-6 bg-gray-800 p-6 rounded-lg shadow-md text-white border border-gray-700'>
          {/* Name Input */}
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-300 mb-1'>
              Agent Name
            </label>
            <input
              type='text'
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='My Custom Agent'
              className='w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white'
              required
              disabled={isLoading}
            />
            <p className='text-xs text-gray-400 mt-1'>
              Enter a descriptive name for your custom agent.
            </p>
          </div>

          {/* Prompt Input */}
          <div>
            <label
              htmlFor='prompt'
              className='block text-sm font-medium text-gray-300 mb-1'>
              Prompt
            </label>
            <textarea
              id='prompt'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder='Enter the custom instructions for your AI agent...'
              className='w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white'
              required
              disabled={isLoading}></textarea>
            <p className='text-xs text-gray-400 mt-1'>
              Be specific about how your agent should behave and respond.
            </p>
          </div>

          {/* Price Input */}
          <div>
            <label
              htmlFor='price'
              className='block text-sm font-medium text-gray-300 mb-1'>
              Price (ETH)
            </label>
            <div className='relative rounded-md shadow-sm'>
              <input
                type='number'
                id='price'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min='0'
                placeholder='0.05'
                className='w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 pl-7 bg-gray-700 text-white'
                required
                disabled={isLoading}
              />
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <span className='text-gray-400 sm:text-sm'>Ξ</span>
              </div>
            </div>
            <p className='text-xs text-gray-400 mt-1'>
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
                    ? 'bg-gray-600 cursor-not-allowed'
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
    </div>
  )
}
