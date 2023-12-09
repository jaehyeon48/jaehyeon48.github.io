import { readdir } from 'node:fs/promises'

interface PostPageProps {
  params: {
    category: string
    slug: string
  }
}

export default function PostPage({
  params: { category, slug },
}: PostPageProps) {
  return (
    <>
      <p>category: {category}</p>
      <p>slug: {slug}</p>
    </>
  )
}

const CWD = process.cwd()

export async function generateStaticParams() {
  const categories = await readdir(`${CWD}/src/posts`)
  const slugs = await Promise.all(categories.map(generateSlugsFromCategory))

  return slugs.flat()
}

async function generateSlugsFromCategory(category: string) {
  const posts = await readdir(`${CWD}/src/posts/${category}`)
  return posts.map((post) => ({ category, post: post.replace('.mdx', '') }))
}
