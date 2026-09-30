import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Building2 } from 'lucide-react'
import { propertyApi } from '../../services/api'
import PropertyCarousel from './PropertyCarousel'
import Skeleton from '../ui/Skeleton'

export default function FeaturedProperties() {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } = useInfiniteQuery({
    queryKey: ['properties', 'home'],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => propertyApi.getAll({ status: 'ACTIVE', sort: 'createdAt', page: pageParam, limit: 12 }, { signal }),
    getNextPageParam: (lastPage) => lastPage.pagination.page < lastPage.pagination.pages ? lastPage.pagination.page + 1 : undefined,
  })
  const properties = useMemo(() => {
    const unique = new Map()
    for (const page of data?.pages || []) for (const property of page.properties || []) unique.set(property.id, property)
    return [...unique.values()]
  }, [data])
  const total = data?.pages[0]?.pagination?.total || properties.length

  return (
    <section id="collection" className="estate-collection estate-container" aria-labelledby="collection-heading">
      <div className="estate-section-heading">
        <div><p className="estate-eyebrow">Discover every listing</p><h2 id="collection-heading">Find your next place.</h2></div>
        <Link to="/properties" className="estate-text-link">View all properties <ArrowUpRight size={16} /></Link>
      </div>
      {isLoading ? <div className="estate-property-grid" aria-label="Loading properties" aria-busy="true">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}</div>
        : isError && !properties.length ? <div className="estate-empty" role="status"><Building2 size={28} strokeWidth={1.2} /><h3>Our collection will be back shortly.</h3><p>We couldn’t load the listings. Please try again in a moment.</p><button className="estate-text-link" onClick={() => refetch()}>Try again <ArrowUpRight size={15} /></button></div>
          : properties.length ? <PropertyCarousel properties={properties} total={total} hasMore={hasNextPage} loadingMore={isFetchingNextPage} loadMore={fetchNextPage} loadError={isFetchNextPageError} />
            : <div className="estate-empty"><Building2 size={28} strokeWidth={1.2} /><h3>A new collection is on its way.</h3><p>There are no active listings yet. Be the first to share your property.</p><Link to="/post-property" className="estate-text-link">List a property <ArrowUpRight size={15} /></Link></div>}
    </section>
  )
}
