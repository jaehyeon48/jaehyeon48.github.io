import { PostBody } from '@/mdx/post-body'
import { getAllPosts } from '@/utils/get-all-posts'
import { getPost } from '@/utils/get-post'

interface PostPageProps {
  params: {
    category: string
    slug: string
  }
}

export default async function PostPage({
  params: { category, slug },
}: PostPageProps) {
  const { content } = await getPost({ category, slug })

  return <PostBody>{content}</PostBody>
}

export async function generateStaticParams() {
  const allPosts = await getAllPosts()

  return allPosts.map(({ frontMatter: { category, slug } }) => ({
    category,
    slug,
  }))
}
