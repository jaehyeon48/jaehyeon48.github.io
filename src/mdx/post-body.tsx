import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

import { contentSection } from '@styles/patterns'

export function PostBody({
  children,
}: {
  children: Parameters<typeof MDXRemote>[0]['source']
}) {
  return (
    <article className={contentSection({ marginTop: 10 })}>
      <MDXRemote
        source={children}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
          },
        }}
      />
    </article>
  )
}
