import 'server-only'

import { readFile, readdir } from 'node:fs/promises'

import { cache } from 'react'
import matter from 'gray-matter'

import { FrontMatter } from '@/types'

import { getCategories } from './get-categories'

interface GetPostsArgs {
  category?: string
}

export const getPosts = cache(getPostsImpl)

async function getPostsImpl({ category }: GetPostsArgs = {}) {
  const pathToPostsDir = `${process.cwd()}/src/posts`
  const allCategories = await getCategories()

  const categories = category
    ? allCategories.filter((cat) => cat === category)
    : allCategories

  const posts = await Promise.all(
    categories.map(async (category) => {
      const slugs = await readdir(`${pathToPostsDir}/${category}`)

      return Promise.all(
        slugs.map(async (slug) => {
          const post = await readFile(`${pathToPostsDir}/${category}/${slug}`)
          const { content, data } = matter(post)

          if (!isValidFrontMatter(data)) {
            throw new Error(`${slug}의 front matter가 올바르지 않습니다.`)
          }

          return { content, frontMatter: data }
        }),
      )
    }),
  )

  return posts.flat()
}

function isValidFrontMatter(data: unknown): data is FrontMatter {
  return (
    typeof data === 'object' &&
    data !== null &&
    'title' in data &&
    'category' in data &&
    'slug' in data &&
    'updatedAt' in data
  )
}
