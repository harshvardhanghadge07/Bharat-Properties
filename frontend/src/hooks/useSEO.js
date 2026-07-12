import { useEffect } from 'react'

// Sets/updates a <meta> tag identified by [attr="key"], creating it if needed.
const setMeta = (attr, key, content) => {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

const setCanonical = (href) => {
  if (!href) return
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Lightweight, dependency-free per-page SEO: sets document.title plus
 * description/OG/Twitter meta tags on mount and restores the previous
 * title on unmount. This is a client-side-only patch — it helps Google's
 * JS-rendering pass and the browser tab title, but crawlers that don't
 * execute JS (WhatsApp, Facebook, Twitter/X link previews) won't see it.
 * Those get real per-listing tags from the backend's /prerender route
 * instead (wired up in nginx.conf).
 */
export default function useSEO({ title, description, image, url }) {
  useEffect(() => {
    const prevTitle = document.title
    if (title) document.title = title

    if (title) {
      setMeta('property', 'og:title', title)
      setMeta('name', 'twitter:title', title)
    }
    if (description) {
      setMeta('name', 'description', description)
      setMeta('property', 'og:description', description)
      setMeta('name', 'twitter:description', description)
    }
    if (image) {
      setMeta('property', 'og:image', image)
      setMeta('name', 'twitter:image', image)
    }
    if (url) {
      setMeta('property', 'og:url', url)
      setCanonical(url)
    }

    return () => { document.title = prevTitle }
  }, [title, description, image, url])
}
