'use client'

import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

interface SlicedTextProps {
  text: string
  className?: string
  containerClassName?: string
  splitSpacing?: number
}

const SlicedText = ({
  text = 'Sliced Text',
  className = '',
  containerClassName = '',
  splitSpacing = 2,
}: SlicedTextProps) => {
  return (
    <motion.div
      className={cn('relative inline-block w-full text-center', containerClassName)}
      whileHover="hover"
      initial="default"
    >
      <motion.div
        className={cn('absolute -ml-0.5 w-full text-4xl', className)}
        variants={{
          default: {
            clipPath: 'inset(0 0 50% 0)',
            y: -splitSpacing / 2,
            opacity: 1,
          },
          hover: {
            clipPath: 'inset(0 0 0 0)',
            y: 0,
            opacity: 0,
          },
        }}
        transition={{ duration: 0.1 }}
      >
        {text}
      </motion.div>
      <motion.div
        className={cn('absolute w-full text-4xl', className)}
        variants={{
          default: {
            clipPath: 'inset(50% 0 0 0)',
            y: splitSpacing / 2,
            opacity: 1,
          },
          hover: {
            clipPath: 'inset(0 0 0 0)',
            y: 0,
            opacity: 1,
          },
        }}
        transition={{ duration: 0.1 }}
      >
        {text}
      </motion.div>

      <div className={cn('invisible text-4xl', className)}>{text}</div>
    </motion.div>
  )
}

export default SlicedText
