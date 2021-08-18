import React, { useRef, useCallback, useEffect } from 'react'

export const Item = ({ title, selectedCategory, onClick }) => {
  const tabRef = useRef(null)

  const handleClick = useCallback(() => {
    onClick(title)
  }, [tabRef])

  return (
    <li
      ref={tabRef}
      className="item"
      aria-selected={selectedCategory === title ? 'true' : 'false'}
    >
      <div onClick={handleClick}>{title}</div>
    </li>
  )
}
