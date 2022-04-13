import React, { useRef, useCallback, useEffect } from 'react'

export const Item = ({ posts, title, selectedCategory, onClick }) => {
  const numOfPosts = title === 'All'
    ? posts.length
    : posts.filter(({ node }) => node.frontmatter.category === title).length;
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
      <div onClick={handleClick}>{title} &#40;{numOfPosts}&#41;</div>
    </li>
  )
}
