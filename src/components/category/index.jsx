import React from 'react'
import './index.scss'
import { Item } from './item'

export const Category = ({ categories, category, selectCategory }) => {
  return (
    <aside className="categories">
      <header className="categories-header">카테고리</header>
      <ul className="category-container">
        <Item title={'All'} selectedCategory={category} onClick={selectCategory} />
        {categories.map((title, idx) => (
          <Item
            key={idx}
            title={title}
            selectedCategory={category}
            onClick={selectCategory}
          />
        ))}
      </ul>
    </aside>
  )
}
