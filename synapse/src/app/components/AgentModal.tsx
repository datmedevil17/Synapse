import { useState } from 'react'
import { X, Bot } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { createAgent } from '@/contracts/function'
import { config } from '../../lib/wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'

const AVAILABLE_LANGUAGES = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Korean',
  'Russian',
  'Arabic'
] as const;

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
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English'])
  const [isLoading, setIsLoading] = useState(false)

  const handleAddMemory = () => {
    if (memory.trim()) {
      setMemories([...memories, memory.trim()])
      setMemory('')
    }
  }

  const handleRemoveMemory = (index: number) => {
    setMemories(memories.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !description || memories.length === 0 || selectedLanguages.length === 0) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const txr = await createAgent(name, memories, selectedLanguages, description)
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
      setSelectedLanguages(['English'])
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
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-cyan-500/30 backdrop-blur-sm animate-pulse"></div>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-xl transform transition-all duration-300 ease-in-out border border-cyan-500/50">
          <div className="flex justify-between items-center p-6 border-b border-cyan-500/30">
            <div className="flex items-center gap-3">
              <Bot className="text-cyan-400 animate-pulse" size={28} />
              <h2 className="text-2xl font-mono bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                INITIALIZING NEW AI AGENT...
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 text-cyan-400 font-mono">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">{'> DESIGNATE IDENTIFIER:'}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-cyan-500/50 rounded-lg bg-black/50 text-cyan-300 placeholder-cyan-700 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter agent designation"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">{'> DEFINE PRIMARY DIRECTIVES:'}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-cyan-500/50 rounded-lg bg-black/50 text-cyan-300 placeholder-cyan-700 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                rows={3}
                placeholder="Input operational parameters"
              />
            </div>

            {/* Memories Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">{'> UPLOAD MEMORY CORES:'}</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={memory}
                  onChange={(e) => setMemory(e.target.value)}
                  className="flex-1 p-3 border border-cyan-500/50 rounded-lg bg-black/50 text-cyan-300 placeholder-cyan-700 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                  placeholder="Input memory data"
                />
                <button
                  type="button"
                  onClick={handleAddMemory}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 shadow-md hover:shadow-cyan-500/20"
                >
                  UPLOAD
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {memories.map((mem, index) => (
                  <span
                    key={index}
                    className="bg-cyan-900/30 border border-cyan-500/30 px-4 py-2 rounded-full flex items-center gap-2 animate-fadeIn"
                  >
                    <span className="text-cyan-300">{mem}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMemory(index)}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">{'> SELECT COMMUNICATION PROTOCOLS:'}</label>
              <div className="relative">
                <select
                  multiple
                  value={selectedLanguages}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedLanguages(values);
                  }}
                  className="w-full p-3 border border-cyan-500/50 rounded-lg bg-black/50 text-cyan-300 
                    focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                >
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <option 
                      key={lang} 
                      value={lang}
                      className="bg-black/90 text-cyan-300 hover:bg-cyan-900/30"
                    >
                      {lang.toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedLanguages.map((lang) => (
                    <span
                      key={lang}
                      className="bg-cyan-900/30 border border-cyan-500/30 px-3 py-1 rounded-full 
                        flex items-center gap-2 animate-fadeIn text-sm"
                    >
                      <span className="text-cyan-300">{lang.toUpperCase()}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedLanguages(prev => prev.filter(l => l !== lang))}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 shadow-md hover:shadow-cyan-500/20 disabled:from-gray-600 disabled:to-gray-700 transform hover:-translate-y-0.5 font-mono"
              >
                {isLoading ? '>> INITIALIZING...' : '>> INITIALIZE AGENT'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}