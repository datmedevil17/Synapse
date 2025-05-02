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
    <nav className='bg-gradient-to-r from-slate-950 to-cyan-950 border-b border-cyan-800/30 shadow-lg shadow-cyan-900/20'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          {/* Logo/Brand */}
          <div className='flex items-center'>
            <Link
              href='/'
              className='text-2xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-2'>
              <span className='tracking-wider'>SYNAPSE</span>
              <span className='h-2 w-2 bg-cyan-400 rounded-full animate-pulse'></span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className='lg:hidden'>
            <button
              onClick={toggleMenu}
              className='p-2 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-cyan-700 transition-all duration-200'>
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
            className={`absolute lg:static left-0 right-0 bg-slate-950/95 backdrop-blur-sm lg:bg-transparent mt-2 lg:mt-0 ${
              isMenuOpen ? 'block' : 'hidden'
            } lg:block border-t lg:border-0 border-cyan-800/30`}>
            <div className='flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6 p-4 lg:p-0'>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    pathname === item.path
                      ? 'bg-cyan-950 text-cyan-400 shadow-lg shadow-cyan-900/50 border border-cyan-800/50'
                      : 'text-gray-400 hover:text-cyan-400 hover:bg-slate-800/50'
                  }`}>
                  {item.name}
                </Link>
              ))}
              <div className='lg:ml-4 relative rounded-lg border border-cyan-800/30'>
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
