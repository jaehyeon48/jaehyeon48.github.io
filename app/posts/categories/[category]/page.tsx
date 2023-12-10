import { Header, HeaderContentPath } from '@/components/header'
import { getCategories } from '@/utils/get-categories'
import { getPosts } from '@/utils/get-posts'

import { css } from '@styles/css'
import { contentSection, grid, headerTitle } from '@styles/patterns'

interface CategoryPageProps {
  params: {
    category: string
  }
}

export default async function CategoryPage({
  params: { category },
}: CategoryPageProps) {
  const posts = await getPosts({ category })

  return (
    <>
      <Header>
        <div className={contentSection()}>
          <HeaderContentPath
            paths={[{ href: `/posts/categories/${category}`, label: category }]}
          />
          <h1 className={headerTitle()}>{category}</h1>
        </div>
      </Header>
      <div className={contentSection()}>
        <p
          className={css({
            width: '100%',
            textAlign: 'right',
            marginBottom: '30px',
            fontSize: {
              base: 16,
              lg: 18,
            },
          })}
        >
          {posts.length} categories
        </p>
        <ul
          className={grid({
            gridTemplateColumns: {
              base: '1fr',
              lg: 'repeat(2, 1fr)',
            },
            gap: 10,
          })}
        >
          {posts.map(({ content, frontMatter: { title, category, slug } }) => (
            <li
              key={title}
              className={css({
                backgroundColor: 'gray.100',
                borderRadius: 6,
                boxShadow: 'md',
              })}
            >
              <a
                href={`/posts/${category}/${slug}`}
                className={css({
                  display: 'block',
                  padding: '24px',
                  _hover: {
                    color: 'emerald.600',
                  },
                })}
              >
                <h2
                  className={css({
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: '8px',
                  })}
                >
                  {title}
                </h2>
                <p
                  className={css({
                    display: '-webkit-box',
                    lineClamp: 3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  })}
                >
                  {content}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export async function generateStaticParams() {
  const categories = await getCategories()

  return categories.map((category) => ({ category }))
}
