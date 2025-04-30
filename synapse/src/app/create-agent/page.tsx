'use client'

import { useState } from 'react'
import { PlusCircle, X } from 'lucide-react'

export default function Home() {
  const [botName, setBotName] = useState('')
  const [description, setDescription] = useState('')
  const [newMemory, setNewMemory] = useState('')
  const [memories, setMemories] = useState<string[]>([])
  const [newLanguage, setNewLanguage] = useState('')
  const [languages, setLanguages] = useState<string[]>([])

  const addMemory = () => {
    if (newMemory.trim()) {
      setMemories([...memories, newMemory.trim()])
      setNewMemory('')
    }
  }

  const removeMemory = (index: number) => {
    setMemories(memories.filter((_, i) => i !== index))
  }

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setLanguages([...languages, newLanguage.trim()])
      setNewLanguage('')
    }
  }

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission will be handled by you
    console.log({
      botName,
      description,
      memories,
      languages,
    })
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-2xl'>
      <h1 className='text-3xl font-bold mb-6 text-center'>Create AI Agent</h1>

      <form
        onSubmit={handleSubmit}
        className='space-y-6 bg-gray-50 p-6 rounded-lg shadow-md'>
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

        {/* Languages */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Languages
          </label>
          <div className='flex'>
            <input
              type='text'
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder='Add a language'
              className='flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            />
            <button
              type='button'
              onClick={addLanguage}
              className='bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors'>
              <PlusCircle size={20} />
            </button>
          </div>

          {/* Language List */}
          <div className='mt-2 flex flex-wrap gap-2'>
            {languages.map((language, index) => (
              <div
                key={index}
                className='flex items-center bg-blue-100 px-3 py-1 rounded-full'>
                <span>{language}</span>
                <button
                  type='button'
                  onClick={() => removeLanguage(index)}
                  className='text-blue-500 hover:text-blue-700 ml-2'>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
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
