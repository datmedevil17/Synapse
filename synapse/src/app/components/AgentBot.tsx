'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Wallet } from 'lucide-react'
import axios from 'axios'
import { useAccount, useConfig } from 'wagmi'
import { payCustomBot } from '@/contracts/function'
import { toast } from 'sonner'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { parseEther } from 'viem'

interface Message {
  role: 'user' | 'agent'
  message: string
}

interface Personality {
  name: string
  description: string
  memories: string[]
  languages: string[]
  isCustom: boolean
  owner : string
  price?: string
  id: number
}

interface AgentBotProps {
  personality: Personality
}

export default function AgentBot(props: AgentBotProps) {
  const { personality } = props
  const { name, description, memories, languages, isCustom, price, id, owner } =
    personality
  const { address,isConnected } = useAccount()

  const [history, setHistory] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [paid, setPaid] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const config = useConfig()
  useEffect(() => {
    if(isConnected){
      if(owner.toLowerCase() === address?.toLowerCase() || isCustom === false){
        setPaid(true)
      }
      else{
        setPaid(false)
      }
    }
  },[isConnected,address])
  useEffect(() => {
    // Auto-scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, isLoading])
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
  }

  const fetchBotResponse = async (userMessage: string) => {
    setIsLoading(true)
    try {
      const res = await axios.post(
        'https://project-backend-vyl4.onrender.com/chat',
        {
          personality,
          history,
          latestMessage: userMessage,
        }
      )
      if (res.status === 400) {
        throw new Error('Bad Request')
      }
      setHistory((prev) => [
        ...prev,
        {
          role: 'agent',
          message: res.data.response || "I couldn't process that request.",
        },
      ])
    } catch (error) {
      console.error('Error getting bot response:', error)
      // Add error message to chat history
      setHistory((prev) => [
        ...prev,
        {
          role: 'agent',
          message: 'Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePay = async () => {
    if (!isCustom || !price || !id) {
      toast.error('Invalid custom bot data')
      return
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setPaymentLoading(true)
    let transact;
    try {
      // Call the payment function from your contracts
      transact = toast.loading('Transaction in progress...')
      const txHash = await payCustomBot(id, parseEther(price))
      toast.dismiss(transact)
      transact = toast.loading('Waiting for transaction confirmation...')
      await waitForTransactionReceipt(config, {
        hash: txHash
      })
      toast.dismiss(transact)
      toast.success('Transaction confirmed!')

      setPaid(true)
      setHistory((prev) => [
        ...prev,
        {
          role: 'agent',
          message:
            'Payment successful! You can now chat with this custom agent. How can I help you?',
        },
      ])
      toast.success('Payment confirmed! You now have access to this agent.')
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')

      // Add error message to chat history
      setHistory((prev) => [
        ...prev,
        {
          role: 'agent',
          message:
            'Sorry, there was an error processing your payment. Please try again.',
        },
      ])
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (message.trim()) {
      const userMessage = message.trim()

      // Add user message to history
      setHistory((prev) => [...prev, { role: 'user', message: userMessage }])

      // Clear input field
      setMessage('')

      // Get bot response
      await fetchBotResponse(userMessage)
    }
  }

  return (
    <div className="flex flex-col h-[600px] w-full bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg overflow-hidden">
      {/* Fixed Header - Reduced padding */}
      <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700/50 backdrop-blur-lg">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-900/50 text-blue-300 font-bold text-lg">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-white">{name}</h3>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1">
              {languages.map((lang, index) => (
                <span
                  key={index}
                  className="px-1.5 py-0.5 bg-blue-900/40 text-blue-300 rounded-full text-xs">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
        {isCustom && (
          <div className={`px-2.5 py-1 ${
            paid ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
          } text-sm rounded-full border ${
            paid ? 'border-green-500/20' : 'border-yellow-500/20'
          }`}>
            {paid ? 'Paid Access' : 'Premium Bot'}
          </div>
        )}
      </div>

      {/* Chat Area - Adjusted padding */}
      <div className="flex-1 overflow-y-auto">
        <div className="h-full px-4 py-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
              <div className='bg-blue-900 text-blue-300 p-3 rounded-full mb-4'>
                {isCustom && !paid ? (
                  <Wallet className='h-6 w-6' />
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    className='h-6 w-6'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
                    />
                  </svg>
                )}
              </div>
              <h3 className='font-semibold text-lg mb-2 text-white'>
                {name} is ready to chat
              </h3>
              <p className='text-gray-400 max-w-md'>{description}</p>

              {isCustom && !paid ? (
                <div className='mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700'>
                  <p className='text-yellow-300 font-medium mb-2'>
                    Premium Custom Agent
                  </p>
                  <p className='text-gray-300 text-sm mb-4'>
                    Kindly pay {price} TRBTC to use this custom agent
                  </p>
                  <button
                    onClick={handlePay}
                    disabled={paymentLoading || !isConnected}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium flex items-center justify-center ${
                      paymentLoading || !isConnected
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    }`}>
                    {paymentLoading ? (
                      <>
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
                        Processing Payment...
                      </>
                    ) : !isConnected ? (
                      'Connect Wallet to Pay'
                    ) : (
                      <>
                        <Wallet className='mr-2 h-4 w-4' />
                        Pay {price} TRBTC
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className='mt-4'>
                  <h4 className='font-medium text-sm mb-2 text-gray-300'>
                    Bot memories:
                  </h4>
                  <ul className='text-xs text-gray-400 space-y-1'>
                    {memories.map((memory, index) => (
                      <li
                        key={index}
                        className='flex items-center'>
                        <span className='mr-2'>•</span>
                        {memory}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {history.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  } animate-fade-in`}>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-lg'
                        : 'bg-gray-800 text-gray-200 rounded-bl-none shadow-lg'
                    }`}>
                    {msg.message}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-4 bg-gray-800 text-gray-200 rounded-2xl rounded-bl-none shadow-lg">
                    <div className="flex space-x-2">
                      <div className="h-3 w-3 rounded-full bg-gray-500 animate-pulse"></div>
                      <div className="h-3 w-3 rounded-full bg-gray-500 animate-pulse delay-75"></div>
                      <div className="h-3 w-3 rounded-full bg-gray-500 animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Reduced padding */}
      <div className="w-full border-t border-gray-700/50 bg-gray-900/90 backdrop-blur-lg">
        <div className="p-3">
          {!isCustom || paid ? (
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={message}
                onChange={handleInputChange}
                placeholder={`Message ${name}...`}
                className="w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                  isLoading || !message.trim()
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                <Send size={18} />
              </button>
            </form>
          ) : (
            <button
              onClick={handlePay}
              disabled={paymentLoading}
              className={`w-full py-4 rounded-xl text-white font-medium flex items-center justify-center transition-all ${
                paymentLoading
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              }`}>
              {paymentLoading ? (
                <>
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
                  Processing Payment...
                </>
              ) : (
                <>
                  <Wallet className='mr-2 h-5 w-5' />
                  Pay {price} TRBTC to Unlock
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
