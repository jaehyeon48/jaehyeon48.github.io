import React from 'react'
import './index.scss'
import { Item } from './item'

export const Category = ({ posts, categories, category, selectCategory }) => {
  return (
    <aside className="categories">
      <ul className="category-container">
        <Item title={'All'} posts={posts} selectedCategory={category} onClick={selectCategory} />
        {categories.map((title, idx) => (
          <Item
            key={idx}
            title={title}
            posts={posts}
            selectedCategory={category}
            onClick={selectCategory}
          />
        ))}
      </ul>
    </aside>
  )
}
