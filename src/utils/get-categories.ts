import 'server-only'

import { readdir } from 'node:fs/promises'

import { cache } from 'react'

export const getCategories = cache(getCategoriesImpl)

function getCategoriesImpl() {
  return readdir(`${process.cwd()}/src/posts`)
}
