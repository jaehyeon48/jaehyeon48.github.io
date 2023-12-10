export interface FrontMatter {
  title: string
  category: string
  slug: string
  /** JavaScript timestamp */
  updatedAt: number
}

export interface Post {
  content: string
  frontMatter: FrontMatter
}
