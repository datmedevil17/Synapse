import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { createAgent } from '@/contracts/function'
import { config } from '../../lib/wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'

interface AgentModalProps {
  isOpen: boolean
  onClose: () => void
  onAgentCreated?: () => void
}

export function AgentModal({ isOpen, onClose, onAgentCreated }: AgentModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [memory, setMemory] = useState('')
  const [memories, setMemories] = useState<string[]>([])
  const [language, setLanguage] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleAddMemory = () => {
    if (memory.trim()) {
      setMemories([...memories, memory.trim()])
      setMemory('')
    }
  }

  const handleAddLanguage = () => {
    if (language.trim()) {
      setLanguages([...languages, language.trim()])
      setLanguage('')
    }
  }

  const handleRemoveMemory = (index: number) => {
    setMemories(memories.filter((_, i) => i !== index))
  }

  const handleRemoveLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !description || memories.length === 0 || languages.length === 0) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const txr = await createAgent(name, memories, languages, description)
      await waitForTransactionReceipt(config, {
        hash: txr,
      })
      toast.success('Agent created successfully!')
      onClose()
      if (onAgentCreated) {
        onAgentCreated()
      }
      // Reset form
      setName('')
      setDescription('')
      setMemories([])
      setLanguages([])
    } catch (error) {
      toast.error('Failed to create agent')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm animate-gradient-xy"></div>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl transform transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center p-6 border-b border-blue-100">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Create AI Agent
            </h2>
            <button 
              onClick={onClose} 
              className="text-blue-400 hover:text-blue-600 transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black-600">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-blue-100 rounded-lg bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter agent name"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black-600">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-blue-100 rounded-lg bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                rows={3}
                placeholder="Enter agent description"
              />
            </div>

            {/* Memories Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-600">Memories</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={memory}
                  onChange={(e) => setMemory(e.target.value)}
                  className="flex-1 p-3 border border-blue-100 rounded-lg bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  placeholder="Add a memory"
                />
                <button
                  type="button"
                  onClick={handleAddMemory}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {memories.map((mem, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-full flex items-center gap-2 animate-fadeIn"
                  >
                    <span className="text-blue-700">{mem}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMemory(index)}
                      className="text-blue-400 hover:text-blue-600 transition-colors duration-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-600">Languages</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="flex-1 p-3 border border-blue-100 rounded-lg bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  placeholder="Add a language"
                />
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-full flex items-center gap-2 animate-fadeIn"
                  >
                    <span className="text-blue-700">{lang}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(index)}
                      className="text-blue-400 hover:text-blue-600 transition-colors duration-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500 transform hover:-translate-y-0.5"
              >
                {isLoading ? 'Creating...' : 'Create Agent'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}