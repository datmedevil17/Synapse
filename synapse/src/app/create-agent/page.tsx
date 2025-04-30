'use client'

import { useEffect, useState } from 'react'
import { PlusCircle, X } from 'lucide-react'
import { createAgent, createProfile, getAgent, getNextTokenId } from '@/contracts/function'
import { toast } from 'sonner'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { useConfig } from 'wagmi'
import { get } from 'http'
export default function Home() {
  const [botName, setBotName] = useState('')
  const [description, setDescription] = useState('')
  const [newMemory, setNewMemory] = useState('')
  const [memories, setMemories] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const config = useConfig()
  // Predefined language options
  const languageOptions = ['English', 'Hindi']
  const fetchAgents = async () => {
    try {
        const totalAgents = await getNextTokenId();
        const agentsData = [];
        const n = Number(totalAgents);
        for(let i=0;i<n;i++){
            const agent = await getAgent(i);
            agentsData.push(agent);
        }
        console.log('Agents:', agentsData);
    }
    catch (error) {
        console.error('Error fetching agents:', error)
    }
  }
  useEffect(() => {
    fetchAgents()
  },[])
  const addMemory = () => {
    if (newMemory.trim()) {
      setMemories([...memories, newMemory.trim()])
      setNewMemory('')
    }
  }

  const removeMemory = (index: number) => {
    setMemories(memories.filter((_, i) => i !== index))
  }

  const handleLanguageChange = (language: string) => {
    if (languages.includes(language)) {
      // Remove if already selected
      setLanguages(languages.filter((lang) => lang !== language))
    } else {
      // Add if not selected
      setLanguages([...languages, language])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!botName || !description) {
      toast.info('Please fill in all required fields')
      return
    }
    if (memories.length === 0) {
      toast.info('Please add at least one memory')
      return
    }
    if (languages.length === 0) {
      toast.info('Please select at least one language')
      return
    }

    try {
      const txr = await createAgent(botName, memories, languages, description)
      await waitForTransactionReceipt(config, {
        hash: txr,
      })
      console.log('Agent created successfully!')
      toast.success('Agent created successfully!')
    } catch (error) {
      toast.error('Failed to create agent')
      console.error(error)
    }
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-2xl'>
      <h1 className='text-3xl font-bold mb-6 text-center'>Create AI Agent</h1>

      <form
        onSubmit={handleSubmit}
        className='space-y-6 bg-gray-50 p-6 rounded-lg shadow-md text-black'>
        {/* Bot Name */}
        <div>
          <label
            htmlFor='botName'
            className='block text-sm font-medium text-gray-700 mb-1'>
            Bot Name
          </label>
          <input
            type='text'
            id='botName'
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            required
          />
        </div>

        {/* Memories */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Memories
          </label>
          <div className='flex'>
            <input
              type='text'
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder='Add a memory'
              className='flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            />
            <button
              type='button'
              onClick={addMemory}
              className='bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors'>
              <PlusCircle size={20} />
            </button>
          </div>

          {/* Memory List */}
          <div className='mt-2 space-y-2'>
            {memories.map((memory, index) => (
              <div
                key={index}
                className='flex items-center bg-gray-100 p-2 rounded-md'>
                <span className='flex-grow'>{memory}</span>
                <button
                  type='button'
                  onClick={() => removeMemory(index)}
                  className='text-red-500 hover:text-red-700 ml-2'>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Languages with Checkboxes */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Languages
          </label>
          <div className='space-y-2'>
            {languageOptions.map((language) => (
              <div
                key={language}
                className='flex items-center'>
                <input
                  type='checkbox'
                  id={`language-${language}`}
                  checked={languages.includes(language)}
                  onChange={() => handleLanguageChange(language)}
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <label
                  htmlFor={`language-${language}`}
                  className='ml-2 block text-sm text-gray-900'>
                  {language}
                </label>
              </div>
            ))}
          </div>

          {/* Selected Languages Display */}
          {languages.length > 0 && (
            <div className='mt-2'>
              <p className='text-xs text-gray-500 mb-1'>Selected languages:</p>
              <div className='flex flex-wrap gap-2'>
                {languages.map((language) => (
                  <div
                    key={language}
                    className='bg-blue-100 px-3 py-1 rounded-full text-sm'>
                    {language}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor='description'
            className='block text-sm font-medium text-gray-700 mb-1'>
            Description
          </label>
          <textarea
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            required></textarea>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type='submit'
            className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
            Create Agent
          </button>
        </div>
      </form>
    </div>
  )
}
