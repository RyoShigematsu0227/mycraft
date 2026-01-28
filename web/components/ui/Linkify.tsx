'use client'

import { Fragment } from 'react'

interface LinkifyProps {
  children: string
  className?: string
}

// URL regex pattern
const URL_REGEX = /(https?:\/\/[^\s<>[\]{}|\\^`"']+)/g

/**
 * Renders text with URLs converted to clickable links
 */
export default function Linkify({ children, className }: LinkifyProps) {
  const parts = children.split(URL_REGEX)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (URL_REGEX.test(part)) {
          // Reset regex lastIndex for next test
          URL_REGEX.lastIndex = 0
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          )
        }
        return <Fragment key={index}>{part}</Fragment>
      })}
    </span>
  )
}
