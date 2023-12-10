import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { format } from 'date-fns'

import { contentSection } from '@styles/patterns'
import { css } from '@styles/css'

interface PostBodyProps {
  children: Parameters<typeof MDXRemote>[0]['source']
  updatedAt: number
}

export function PostBody({ children, updatedAt }: PostBodyProps) {
  return (
    <div className={css({ backgroundColor: 'white' })}>
      <article className={contentSection({ paddingBottom: '50px' })}>
        <MDXRemote
          source={children}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
            },
          }}
        />
        <div className={css({ marginTop: '30px' })}>
          <p className={css({ fontSize: 18, fontWeight: 700 })}>
            {format(new Date(updatedAt), "MMM. dd'th', yyyy - HH:mm")}
          </p>
        </div>
      </article>
    </div>
  )
}
