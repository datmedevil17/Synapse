'use client'

import { useEffect, useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { getAgent, getNextTokenId } from '@/contracts/function'
import { AgentModal } from '../components/AgentModal'
import Link from 'next/link'

interface Agent {
  id: number
  name: string
  description: string
  memories: string[]
  languages: string[]
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchAgents = async () => {
    try {
      const totalAgents = await getNextTokenId()
      const agentsData: Agent[] = []
      const n = Number(totalAgents)
      for (let i = 0; i < n; i++) {
        const agent = (await getAgent(i)) as Agent
        agent.id = i
        agentsData.push(agent)
      }

      setAgents(agentsData)
    } catch (error) {
      console.error('Error fetching agents:', error)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Agents Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {agents.map((agent, index) => (
          <Link
            href={`/agents/${agent.id}`}
            key={index}
            className='block transition-transform hover:scale-105 hover:shadow-lg'>
            <div className='bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 h-full'>
              <h3 className='text-xl font-bold mb-2 text-white'>
                {agent.name}
              </h3>
              <p className='text-gray-300 mb-4'>{agent.description}</p>
              <div className='space-y-2'>
                <div className='flex flex-wrap gap-1'>
                  {agent.languages.map((lang, i) => (
                    <span
                      key={i}
                      className='bg-blue-900 text-blue-200 px-2 py-1 rounded-full text-sm'>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Add Agent Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className='fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors'>
        <PlusCircle size={24} />
      </button>

      {/* Agent Creation Modal */}
      <AgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
