import { Header } from '@/components/header'
import { CaretRightIcon } from '@/icons/caret-right'
import { PostBody } from '@/mdx/post-body'
import { getAllPosts } from '@/utils/get-all-posts'
import { getPost } from '@/utils/get-post'

import { ANCHOR_STYLE } from './styles'

import { css } from '@styles/css'
import { contentSection, flex } from '@styles/patterns'

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
    frontMatter: { title },
  } = await getPost({ category, slug })

  return (
    <>
      <Header>
        <div
          className={contentSection({
            position: 'absolute',
            bottom: '50px',
            left: 0,
          })}
        >
          <div
            className={flex({
              gap: 2,
              align: 'center',
              color: 'g',
              hideBelow: 'sm',
            })}
          >
            <a href="/" className={ANCHOR_STYLE}>
              Home
            </a>
            <CaretRightIcon width={18} height={18} color="gray.400" />
            <a href={`/posts/${category}`} className={ANCHOR_STYLE}>
              {category}
            </a>
            <CaretRightIcon width={18} height={18} color="gray.400" />
            <a href={`/posts/${category}/${slug}`} className={ANCHOR_STYLE}>
              {slug}
            </a>
          </div>
          <h1
            className={css({
              fontSize: {
                base: '24px',
                lg: '30px',
              },
              fontWeight: 700,
              marginTop: '4px',
            })}
          >
            {title}
          </h1>
        </div>
      </Header>
      <PostBody>{content}</PostBody>
    </>
  )
}

export async function generateStaticParams() {
  const allPosts = await getAllPosts()

  return allPosts.map(({ frontMatter: { category, slug } }) => ({
    category,
    slug,
  }))
}
