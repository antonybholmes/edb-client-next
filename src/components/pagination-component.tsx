import type { IDivProps } from '@interfaces/div-props'
import { range } from '@lib/math/range'
import { useEffect } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './shadcn/ui/themed/pagination'

interface IPaginationProps extends IDivProps {
  itemCount?: number
  itemsPerPage?: number
  currentPage?: number
  setCurrentPage?: (page: number) => void
  alwaysShown?: boolean
}

/**
 *
 * Based on https://github.com/lukaaspl/ellipsis-pagination.
 *
 * @param param0
 * @returns
 */
export function PaginationComponent({
  itemCount = 0,
  itemsPerPage = 100,
  currentPage = 1,
  setCurrentPage,
  alwaysShown = true,
  className,
}: IPaginationProps) {
  const pagesCount = Math.ceil(itemCount / itemsPerPage) //+ 40
  const isPaginationShown = alwaysShown ? true : pagesCount > 1
  const isCurrentPageFirst = currentPage === 1
  const isCurrentPageLast = currentPage === pagesCount

  function changePage(page: number) {
    if (currentPage === page) {
      return
    }
    setCurrentPage?.(Math.max(1, Math.min(pagesCount, page)))
  }

  function onPageNumberClick(page: number) {
    changePage(page)
  }

  function onPreviousPageClick() {
    changePage(currentPage - 1)
  }

  function onNextPageClick() {
    changePage(currentPage + 1)
  }

  useEffect(() => {
    if (currentPage > pagesCount) {
      changePage(pagesCount)
    }
  }, [pagesCount])

  let isPageNumberOutOfRange: boolean

  const pageNumbers = range(pagesCount).map(index => {
    const pageNumber = index + 1
    const isPageNumberFirst = pageNumber === 1
    const isPageNumberLast = pageNumber === pagesCount

    const isCurrentPageWithinTwoPageNumbers =
      Math.abs(pageNumber - currentPage) <= 2

    if (
      isPageNumberFirst ||
      isPageNumberLast ||
      isCurrentPageWithinTwoPageNumbers
    ) {
      isPageNumberOutOfRange = false
      return (
        <PaginationLink
          key={pageNumber}
          onClick={() => onPageNumberClick(pageNumber)}
          isActive={pageNumber === currentPage}
        >
          {pageNumber}
        </PaginationLink>
      )
    }

    if (!isPageNumberOutOfRange) {
      isPageNumberOutOfRange = true
      return <PaginationEllipsis key={pageNumber} />
    }

    return null
  })

  return (
    <>
      {isPaginationShown && (
        <Pagination>
          <PaginationContent className={className}>
            <PaginationPrevious
              onClick={onPreviousPageClick}
              disabled={isCurrentPageFirst}
            />
            {pageNumbers}
            <PaginationNext
              onClick={onNextPageClick}
              disabled={isCurrentPageLast}
            />
          </PaginationContent>
        </Pagination>
      )}
    </>
  )
}
