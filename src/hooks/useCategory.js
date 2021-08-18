import { useEffect, useState, useCallback } from 'react'
import qs from 'query-string'
import { CATEGORY_TYPE } from '../constants'
import * as ScrollManager from '../utils/scroll'

export function useCategory() {
  const [category, setCategory] = useState(CATEGORY_TYPE.ALL)

  const selectCategory = useCallback(category => {
    setCategory(category)
    window.history.pushState(
      { category },
      '',
      `${window.location.pathname}?${qs.stringify({ category })}`
    )
  }, [])
  const changeCategory = useCallback(() => {
    const { category } = qs.parse(location.search)
    const target = category == null ? CATEGORY_TYPE.ALL : category

    setCategory(target)
  }, [])

  useEffect(() => {
    ScrollManager.init()
    return () => {
      ScrollManager.destroy()
    }
  }, [])

  useEffect(() => {
    window.addEventListener('popstate', changeCategory)

    return () => {
      window.removeEventListener('popstate', changeCategory)
    }
  }, [])

  return [category, selectCategory]
}
