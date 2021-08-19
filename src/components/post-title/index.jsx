import React from 'react'

export const PostTitle = ({ title, category }) => {
    return (
        <div className="post-title">
            <h1 className="post-title-name">{title}</h1>
            <span className="post-category">카테고리: {category}</span>
        </div>
    );
}