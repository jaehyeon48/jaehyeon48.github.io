import { getCategories } from '@/utils/get-categories'

import { contentSection, grid, headerTitle } from '@styles/patterns'
import { css } from '@styles/css'
import { Header } from '@components/header'

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <>
      <Header>
        <h1 className={headerTitle()}>Categories</h1>
      </Header>
      <section
        className={contentSection({
          position: 'relative',
          width: '100%',
          backgroundColor: 'white',
        })}
      >
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
          {categories.length} categories
        </p>
        <ul
          className={grid({
            gridTemplateColumns: {
              base: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: 10,
          })}
        >
          {categories.map((category) => (
            <li
              key={category}
              className={css({
                backgroundColor: 'gray.100',
                borderRadius: 6,
                boxShadow: 'md',
              })}
            >
              <a
                href={`/posts/categories/${category}`}
                className={css({
                  display: 'block',
                  padding: '24px',
                  _hover: {
                    color: 'emerald.600',
                    fontWeight: 700,
                  },
                })}
              >
                {category}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
