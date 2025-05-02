'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'

const Navbar = () => {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'All Agents', path: '/create-agent' },
    { name: 'All Custom Agents', path: '/custom-agents' },
  ]

  return (
    <nav className='bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          {/* Logo/Brand */}
          <div className='flex items-center'>
            <Link
              href='/'
              className='text-2xl font-bold text-white hover:text-blue-400 transition-colors duration-200'>
              Synapse
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className='lg:hidden'>
            <button
              onClick={toggleMenu}
              className='p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200'>
              <svg
                className='h-6 w-6'
                fill='none'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                {isMenuOpen ? (
                  <path d='M6 18L18 6M6 6l12 12' />
                ) : (
                  <path d='M4 6h16M4 12h16M4 18h16' />
                )}
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <div
            className={`absolute lg:static left-0 right-0 bg-gray-900 lg:bg-transparent mt-2 lg:mt-0 ${
              isMenuOpen ? 'block' : 'hidden'
            } lg:block`}>
            <div className='flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6 p-4 lg:p-0'>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    pathname === item.path
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}>
                  {item.name}
                </Link>
              ))}
              <div className='lg:ml-4'>
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
