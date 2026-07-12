import Property from '../models/Property.js'

const SITE_NAME = 'Bharat Properties'
const clientUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')

const escapeXml = (str = '') =>
  String(str).replace(/[<>&'"]/g, (c) => ({ '<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;' }[c]))

const escapeHtml = escapeXml

const formatPriceServer = (price) => {
  const n = Number(price) || 0
  if (n >= 10000000) return `Rs ${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000)   return `Rs ${(n / 100000).toFixed(2)} L`
  return `Rs ${n.toLocaleString('en-IN')}`
}

// ── Sitemap ─────────────────────────────────────────────────────────────
// Dynamic XML sitemap listing static pages + every active property.
// Wired up in nginx.conf so /sitemap.xml at the site root reaches this route.
export const getSitemap = async (req, res, next) => {
  try {
    const base = clientUrl()
    const staticPaths = ['', '/properties', '/about', '/contact', '/pricing', '/privacy', '/terms', '/refund']
    const properties = await Property.find({ status: 'ACTIVE' }).select('_id updatedAt').lean()

    const urls = [
      ...staticPaths.map((p) => `  <url><loc>${base}${p}</loc></url>`),
      ...properties.map((p) =>
        `  <url><loc>${base}/properties/${p._id}</loc><lastmod>${new Date(p.updatedAt || Date.now()).toISOString()}</lastmod></url>`
      ),
    ]

    res.set('Content-Type', 'application/xml')
    res.send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
    )
  } catch (err) { next(err) }
}

// ── Crawler-only prerendered HTML ──────────────────────────────────────
// A minimal static page with correct <meta>/OG/Twitter tags for whichever
// URL a social/search crawler requested. Real visitors never see this —
// nginx only routes known bot user-agents here (see the `map` block in
// nginx.conf); everyone else gets the normal React app straight from
// index.html, where per-page tags are instead set client-side (useSEO).
const renderShell = ({ title, description, image, url, jsonLd }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${url}" />
${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(description)}</p>
<p><a href="${url}">View on ${SITE_NAME}</a></p>
</body>
</html>`

export const prerenderProperty = async (req, res, next) => {
  try {
    const url = `${clientUrl()}/properties/${req.params.id}`
    const property = await Property.findById(req.params.id).lean()

    if (!property) {
      res.set('Content-Type', 'text/html')
      return res.send(renderShell({
        title: `Property not found | ${SITE_NAME}`,
        description: 'This listing may have been removed or sold.',
        url,
      }))
    }

    const bhk = property.bedrooms ? `${property.bedrooms} BHK ` : ''
    const title = `${property.title} — ${formatPriceServer(property.price)} | ${SITE_NAME}`
    const description = `${bhk}${(property.type || 'Property').toLowerCase()} in ${property.location}, ${property.city}. ${property.areaSqft ? property.areaSqft + ' sq.ft — ' : ''}${formatPriceServer(property.price)}.`

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: property.title,
      description,
      url,
      image: property.images?.[0],
      address: { '@type': 'PostalAddress', addressLocality: property.city, addressRegion: property.state, addressCountry: 'IN' },
    }

    res.set('Content-Type', 'text/html')
    res.send(renderShell({ title, description, image: property.images?.[0], url, jsonLd }))
  } catch (err) { next(err) }
}

export const prerenderGeneric = (req, res) => {
  const path = req.originalUrl.replace(/^\/prerender/, '') || '/'
  const url = `${clientUrl()}${path}`
  res.set('Content-Type', 'text/html')
  res.send(renderShell({
    title: `${SITE_NAME} — Buy, Sell & Rent Property in India`,
    description: 'Find verified apartments, villas, plots and commercial properties for sale and rent across major Indian cities.',
    url,
  }))
}
