import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

import { contentSection } from '@styles/patterns'
import { css } from '@styles/css'

export function PostBody({
  children,
}: {
  children: Parameters<typeof MDXRemote>[0]['source']
}) {
  return (
    <div className={css({ backgroundColor: 'white' })}>
      <article className={contentSection({})}>
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
    </div>
  )
}
