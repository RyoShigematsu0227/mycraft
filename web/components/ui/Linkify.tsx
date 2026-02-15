'use client'

import { Fragment } from 'react'

interface LinkifyProps {
  children: string
  className?: string
}

// URL regex pattern (global for split, non-global for test)
const URL_REGEX_SPLIT = /(https?:\/\/[^\s<>[\]{}|\\^`"']+)/g
const URL_REGEX_TEST = /^https?:\/\/[^\s<>[\]{}|\\^`"']+$/

/**
 * Renders text with URLs converted to clickable links
 */
export default function Linkify({ children, className }: LinkifyProps) {
  const parts = children.split(URL_REGEX_SPLIT)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (URL_REGEX_TEST.test(part)) {
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
