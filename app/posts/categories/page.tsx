import { getCategories } from '@/utils/get-categories'

import { contentSection, headerTitle } from '@styles/patterns'
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
        className={css({
          width: '100%',
          backgroundColor: 'white',
        })}
      >
        <ul className={contentSection()}>
          {categories.map((category) => (
            <li key={category}>{category}</li>
          ))}
        </ul>
      </section>
    </>
  )
}
