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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const config = useConfig()

  interface CustomAgent {
    id?: number
    name: string
    description: string
    isCustom: boolean
    memories: string[]
    languages: string[]
    price?: string
  }


  const [agentsData, setAgentsData] = useState<CustomAgent[]>([])

  const fetchAgents = async () => {
    setIsDataLoading(true)
    try {
      const totalAgents = await getNextTokenId()
      const agentsData: CustomAgent[] = []
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
          const price = (formatEther((await getCustomBotPrice(i)) as bigint))
          typedAgent.price = (price)
          console.log(price)
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
    <div className='min-h-screen bg-gray-900 text-cyan-500'>
      <div className='container mx-auto px-4 py-8'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-4xl font-bold tracking-wider text-cyan-400 glitch-text'>
            SYNTH-AGENTS
          </h1>
          <button
            onClick={() => setIsDialogOpen(true)}
            className='px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-md 
            hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 transition-all
            duration-200 border border-cyan-400 shadow-lg shadow-cyan-500/20'>
            <span className='font-mono text-gray-900 font-semibold'>INITIALIZE_NEW_AGENT()</span>
          </button>
        </div>

        {/* Agents Grid */}
        <div className='mb-12'>
          <h2 className='text-2xl font-mono mb-6 border-b border-cyan-500/30 pb-2'>
             AVAILABLE_CUSTOM_AGENTS
          </h2>

          {isDataLoading ? (
            <div className='flex justify-center items-center py-12'>
              <div className='animate-pulse text-cyan-400 font-mono'>
                LOADING_AGENTS...
              </div>
            </div>
          ) : agentsData.length === 0 ? (
            <div className='border border-cyan-500/30 rounded-lg p-6 bg-gray-800/50 backdrop-blur'>
              <p className='text-cyan-400 font-mono text-center'>
                NO_AGENTS_FOUND :: INITIALIZE_NEW_AGENT_TO_BEGIN
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {agentsData.map((agent, index) => (
                <Link
                  href={`/agents/${agent.id}`}
                  key={index}
                  className='block group'>
                  <div className='relative h-full bg-gray-800/80 rounded-lg border border-cyan-500/30 
                    p-6 backdrop-blur transition-all duration-300
                    hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 
                    transform hover:scale-102 hover:-translate-y-1'>
                    <div className='absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg'></div>
                    
                    {/* Header Section */}
                    <div className='flex justify-between items-start mb-4'>
                      <h3 className='text-xl font-mono text-cyan-400 font-semibold tracking-wide'>
                        {agent.name}
                      </h3>
                      <div className='flex items-center space-x-2'>
                        <span className='px-3 py-1.5 bg-cyan-500/10 text-cyan-300 text-sm rounded-md 
                          font-mono border border-cyan-500/30 backdrop-blur-sm'>
                          Ξ {agent.price}
                        </span>
                      </div>
                    </div>
                    
                    {/* Description Section */}
                    <div className='mb-6'>
                      <p className='text-gray-300/90 line-clamp-3 font-light leading-relaxed'>
                        {agent.description}
                      </p>
                    </div>
                    
                    {/* Footer Section */}
                    <div className='pt-4 mt-auto border-t border-cyan-500/20 flex justify-between items-center'>
                      <span className='text-xs text-cyan-400 font-mono tracking-wider'>
                        STATUS :: PREMIUM_AGENT
                      </span>
                      <span className='text-xs text-cyan-400/70 font-mono'>
                        ID :: {String(agent.id).padStart(4, '0')}
                      </span>
                    </div>
                    
                    {/* Hover Effect Overlay */}
                    <div className='absolute inset-0 border-2 border-cyan-400/0 rounded-lg 
                      transition-all duration-300 group-hover:border-cyan-400/20'></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Create Agent Dialog */}
        {isDialogOpen && (
          <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center 
          justify-center z-50'>
            <div className='bg-gray-900 border border-cyan-500/30 rounded-lg w-full max-w-2xl 
            p-6 shadow-xl shadow-cyan-500/20'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-mono text-cyan-400'>
                  NEW_AGENT_INITIALIZATION
                </h2>
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className='text-cyan-400 hover:text-cyan-300'>
                  <span className='sr-only'>Close</span>
                  <span className='text-2xl'>×</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Existing form inputs with updated styling */}
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-mono text-cyan-400 mb-1'>
                      AGENT_NAME::
                    </label>
                    <input
                      type='text'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className='w-full bg-gray-800 border border-cyan-500/30 rounded-md px-4 py-2 
                      text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 
                      placeholder-gray-500'
                      placeholder='ENTER_AGENT_NAME'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='prompt'
                      className='block text-sm font-mono text-cyan-400 mb-1'>
                      AGENT_PROMPT::
                    </label>
                    <textarea
                      id='prompt'
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={6}
                      placeholder='ENTER_AGENT_PROMPT'
                      className='w-full bg-gray-800 border border-cyan-500/30 rounded-md px-4 py-2 
                      text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 
                      placeholder-gray-500'
                      required
                      disabled={isLoading}></textarea>
                  </div>

                  <div>
                    <label
                      htmlFor='price'
                      className='block text-sm font-mono text-cyan-400 mb-1'>
                      AGENT_PRICE (ETH)::
                    </label>
                    <div className='relative rounded-md shadow-sm'>
                      <input
                        type='number'
                        id='price'
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min='0'
                        step="any"
                        placeholder='0.05'
                        className='w-full bg-gray-800 border border-cyan-500/30 rounded-md px-4 py-2 
                        text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 
                        placeholder-gray-500'
                        required
                        disabled={isLoading}
                      />
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <span className='text-cyan-400 sm:text-sm'>Ξ</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='flex justify-end gap-4 mt-6'>
                  <button
                    type='button'
                    onClick={() => setIsDialogOpen(false)}
                    className='px-4 py-2 border border-cyan-500/30 rounded-md text-cyan-400 
                    hover:bg-cyan-500/20'>
                    CANCEL
                  </button>
                  <button
                    type='submit'
                    disabled={isLoading}
                    className='px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-md 
                    text-white hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 
                    disabled:cursor-not-allowed'>
                    {isLoading ? 'INITIALIZING...' : 'INITIALIZE_AGENT()'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
