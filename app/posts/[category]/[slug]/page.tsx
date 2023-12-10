import { PostBody } from '@/mdx/post-body'
import { getPosts } from '@/utils/get-posts'
import { getPost } from '@/utils/get-post'

import { contentSection, headerTitle } from '@styles/patterns'
import { Header, HeaderContentPath } from '@components/header'

interface PostPageProps {
  params: {
    category: string
    slug: string
  }
}

export default async function PostPage({
  params: { category, slug },
}: PostPageProps) {
  const {
    content,
    frontMatter: { title, updatedAt },
  } = await getPost({ category, slug })

  return (
    <>
      <Header>
        <div className={contentSection()}>
          <HeaderContentPath
            paths={[
              { href: `/posts/categories/${category}`, label: category },
              { href: `/posts/${category}/${slug}`, label: slug },
            ]}
          />
          <h1 className={headerTitle()}>{title}</h1>
        </div>
      </Header>
      <PostBody updatedAt={updatedAt}>{content}</PostBody>
    </>
  )
}

export async function generateStaticParams() {
  const allPosts = await getPosts()

  return allPosts.map(({ frontMatter: { category, slug } }) => ({
    category,
    slug,
  }))
}
