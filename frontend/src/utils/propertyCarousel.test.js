import test from 'node:test'
import assert from 'node:assert/strict'
import { QueryClient, InfiniteQueryObserver } from '@tanstack/react-query'
import { carouselMove, shouldLoadCarouselImage } from './propertyCarousel.js'

const tail = { scrollLeft: 900, maxScroll: 900, step: 300, direction: 1, hasMore: true, loadingMore: false, loadError: false }

test('a slow next page does not stop the loaded carousel or start duplicate requests', () => {
  assert.deepEqual(carouselMove({ ...tail, loadingMore: true }), { target: 0, requestPage: false })
})

test('a failed next page keeps loaded cards moving without automatic retry loops', () => {
  assert.deepEqual(carouselMove({ ...tail, loadError: true }), { target: 0, requestPage: false })
  assert.deepEqual(carouselMove({ ...tail, scrollLeft: 300, loadError: true }), { target: 600, requestPage: false })
})

test('the tail requests more listings when available and wraps when fully loaded', () => {
  assert.deepEqual(carouselMove(tail), { target: 0, requestPage: true })
  assert.deepEqual(carouselMove({ ...tail, hasMore: false }), { target: 0, requestPage: false })
  assert.deepEqual(carouselMove({ ...tail, scrollLeft: 0, direction: -1 }), { target: 900, requestPage: false })
  assert.deepEqual(carouselMove({ ...tail, scrollLeft: 0, maxScroll: 0, hasMore: false }), { target: 0, requestPage: false })
})

test('preload photos ahead of the current slide and for wraparound, with bounded eager loading', () => {
  assert.equal(shouldLoadCarouselImage(10, 6, true), true)
  assert.equal(shouldLoadCarouselImage(0, 20, true), true)
  assert.equal(shouldLoadCarouselImage(30, 6, true), false)
  assert.equal(shouldLoadCarouselImage(0, 1, false), false)
})

test('concurrent next-page triggers share one request; errors retain cards and allow retry', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })
  let nextPageCalls = 0
  let failNextPage
  const observer = new InfiniteQueryObserver(client, {
    queryKey: ['carousel-loading-test'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      if (pageParam === 1) return { page: 1, properties: ['first'] }
      nextPageCalls += 1
      if (nextPageCalls === 1) return new Promise((resolve, reject) => { failNextPage = reject })
      return { page: 2, properties: ['second'] }
    },
    getNextPageParam: (page) => page.page < 2 ? 2 : undefined,
  })
  const unsubscribe = observer.subscribe(() => {})
  try {
    await observer.refetch()
    const first = observer.fetchNextPage({ cancelRefetch: false })
    const duplicate = observer.fetchNextPage({ cancelRefetch: false })
    assert.equal(nextPageCalls, 1)
    failNextPage(new Error('Temporary network failure'))
    await Promise.all([first, duplicate])
    assert.equal(observer.getCurrentResult().isFetchNextPageError, true)
    assert.deepEqual(observer.getCurrentResult().data.pages[0].properties, ['first'])
    await observer.fetchNextPage({ cancelRefetch: false })
    assert.equal(nextPageCalls, 2)
    assert.equal(observer.getCurrentResult().isFetchNextPageError, false)
    assert.equal(observer.getCurrentResult().data.pages.length, 2)
  } finally {
    unsubscribe()
    client.clear()
  }
})
