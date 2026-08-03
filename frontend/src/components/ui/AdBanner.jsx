import { useEffect, useRef } from 'react'

export default function AdBanner({ dataAdSlot, className = '' }) {
  const adRef = useRef(null)

  useEffect(() => {
    try {
      // Prevent pushing the same ad twice
      if (adRef.current && !adRef.current.dataset.adsbygoogleStatus) {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (e) {
      console.error('AdSense error:', e)
    }
  }, [])

  return (
    <div className={`w-full overflow-hidden flex items-center justify-center rounded-2xl ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle w-full"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your publisher ID
        data-ad-slot={dataAdSlot || 'YYYYYYYYYY'}   // Replace with your ad slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  )
}
