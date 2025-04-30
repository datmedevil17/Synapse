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
    { name: 'All Agents', path: '/agents' },
    { name: 'All Custom Agents', path: '/custom-agents' },
  ]

  return (
    <nav className='bg-gray-800 p-4'>
      <div className='container mx-auto flex flex-wrap items-center justify-between'>
        {/* Logo/Brand */}
        <div className='flex items-center flex-shrink-0 text-white mr-6'>
          <Link
            href='/'
            className='font-bold text-xl tracking-tight'>
            Synapse
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className='block lg:hidden'>
          <button
            onClick={toggleMenu}
            className='flex items-center px-3 py-2 border rounded text-gray-200 border-gray-400 hover:text-white hover:border-white'>
            <svg
              className='fill-current h-3 w-3'
              viewBox='0 0 20 20'
              xmlns='http://www.w3.org/2000/svg'>
              <title>Menu</title>
              <path d='M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z' />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div
          className={`w-full block flex-grow lg:flex lg:items-center lg:w-auto ${
            isMenuOpen ? 'block' : 'hidden lg:block'
          }`}>
          <div className='text-sm lg:flex-grow'>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`block mt-4 lg:inline-block lg:mt-0 px-4 py-2 rounded transition-colors duration-200 ${
                  pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-200 hover:text-white hover:bg-gray-700'
                } mr-4`}>
                {item.name}
              </Link>
            ))}
          </div>
          <div className='mt-4 lg:mt-0'>
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
