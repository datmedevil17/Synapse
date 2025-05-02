'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getAgent, getAgentOwner, getCustomBotPrice } from '@/contracts/function'
import AgentBot from '@/app/components/AgentBot'
import { toast } from 'sonner'
import { formatEther } from 'viem'

interface Agent {
  name: string
  description: string
  memories: string[]
  languages: string[]
  isCustom: boolean
  owner: string
  id: number
  price?: number
}

export default function AgentPage() {
  const router = useRouter()
  const params = useParams()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const id = params?.id

        if (!id) {
          router.push('/agents')
          return
        }

        setLoading(true)
        const agentData = (await getAgent(Number(id))) as Agent
        agentData.id = Number(id)
        agentData.owner = await getAgentOwner(Number(id)) as string
        if (!agentData) {
          toast.error('Agent not found')
          router.push('/agents')
          return
        }
        if(agentData.isCustom){
          const price = await getCustomBotPrice(Number(id)) as bigint;
          agentData.price = Number(formatEther(price))
        }
        setAgent(agentData)
      } catch (error) {
        console.error('Error fetching agent:', error)
        toast.error('Failed to load agent')
        router.push('/agents')
      } finally {
        setLoading(false)
      }
    }
    fetchAgent()
  }, [params?.id, router])

  // Show loading state
  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='flex flex-col items-center'>
          <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500'></div>
          <p className='mt-4 text-lg font-medium text-gray-700'>
            Loading agent...
          </p>
        </div>
      </div>
    )
  }

  // If agent data is loaded successfully
  if (agent) {
    return (
      <div className='container mx-auto px-4 py-8'>
        {/* Agent Bot Component */}
        <AgentBot
          personality={agent || {
            name: 'Agent',
            description: 'This is a default agent.',
            memories: [],
            languages: [],
            isCustom: false,
          }}
        />
      </div>
    )
  }

  // Fallback - this should rarely show as we redirect in the useEffect
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='text-center'>
        <h2 className='text-xl font-semibold text-gray-700'>Agent not found</h2>
        <button
          onClick={() => router.push('/agents')}
          className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'>
          Back to Agents
        </button>
      </div>
    </div>
  )
}
