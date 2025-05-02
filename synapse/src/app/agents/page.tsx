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
      for (let i = 2; i < n; i++) {
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
    <div className='w-full px-4 py-8 bg-gradient-to-b from-slate-900 to-slate-800 min-h-screen'>
      
      {/* Agents Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[2000px] mx-auto'>
        {agents
          .filter(agent => agent.description !== "Custom Bot")
          .map((agent, index) => (
          <Link
            href={`/agents/${agent.id}`}
            key={index}
            className='block transition-all duration-300 hover:scale-102 hover:shadow-cyan-400/20'>
            <div className='bg-slate-800/50 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-6 h-full 
                          hover:border-cyan-400 group relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 
                            group-hover:opacity-100 transition-opacity'></div>
              <div className='relative z-10'>
                <h3 className='text-xl font-bold mb-3 text-cyan-400 flex items-center gap-2'>
                  <span className='w-2 h-2 bg-cyan-400 rounded-full animate-pulse'></span>
                  {agent.name}
                </h3>
                <p className='text-slate-300 mb-4 leading-relaxed'>{agent.description}</p>
                <div className='space-y-2'>
                  <div className='flex flex-wrap gap-2'>
                    {agent.languages.map((lang, i) => (
                      <span
                        key={i}
                        className='bg-slate-700 text-cyan-300 px-3 py-1 rounded-md text-sm font-mono border border-cyan-500/30'>
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Add Agent Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className='fixed bottom-8 right-8 bg-cyan-500 text-slate-900 p-4 rounded-full shadow-lg 
                   hover:bg-cyan-400 transition-all duration-300 group shadow-cyan-500/20'>
        <PlusCircle size={24} className='group-hover:scale-110 transition-transform' />
        <span className='absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-slate-800 
                        text-cyan-400 py-2 px-4 rounded-lg text-sm opacity-0 group-hover:opacity-100 
                        transition-opacity whitespace-nowrap border border-cyan-500/30'>
          Initialize New Agent
        </span>
      </button>

      <AgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
