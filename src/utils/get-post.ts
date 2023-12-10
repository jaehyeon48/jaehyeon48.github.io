import 'server-only'

import { getPosts } from './get-posts'

interface GetPostArgs {
  category: string
  slug: string
}

export async function getPost({ category, slug }: GetPostArgs) {
  const allPosts = await getPosts()

  const post = allPosts.find(
    ({ frontMatter }) =>
      frontMatter.category === category && frontMatter.slug === slug,
  )

  if (!post) {
    throw new Error(`${category} 카테고리의 ${slug} 포스트가 없습니다.`)
  }

  return post
}
