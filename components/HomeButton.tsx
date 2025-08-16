'use client'

import React from 'react'
import Link from 'next/link'
import { HomeIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

interface HomeButtonProps {
  className?: string
  showText?: boolean
  variant?: 'primary' | 'secondary' | 'floating'
}

const HomeButton: React.FC<HomeButtonProps> = ({ 
  className = '', 
  showText = true, 
  variant = 'primary' 
}) => {
  const handleHomeClick = () => {
    window.location.href = '/'
  }

  const getButtonClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'btn-secondary'
      case 'floating':
        return 'fixed bottom-6 right-6 z-50 bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 rounded-full p-3'
      default:
        return 'btn-primary'
    }
  }

  const getIconClasses = () => {
    switch (variant) {
      case 'floating':
        return 'h-6 w-6 text-primary-600'
      default:
        return 'h-4 w-4'
    }
  }

  return (
    <motion.button
      onClick={handleHomeClick}
      className={`${getButtonClasses()} ${className} flex items-center space-x-2`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      title="Go to Home"
    >
    <Link href="/">
      <HomeIcon className={getIconClasses()} />
      {showText && <span>Home</span>}
    </Link>
    </motion.button>
  )
}

export default HomeButton
