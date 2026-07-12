import dns from 'node:dns'

// A curated list of well-known disposable/temp-mail providers. Not
// exhaustive (new ones pop up constantly) — this is a cheap first filter,
// the real backstop is the MX check below plus requiring verification
// before sensitive actions (see requireVerifiedContact middleware).
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', '10minutemail.com',
  'tempmail.com', 'temp-mail.org', 'throwawaymail.com', 'yopmail.com', 'trashmail.com',
  'getnada.com', 'fakeinbox.com', 'sharklasers.com', 'dispostable.com', 'mintemail.com',
  'maildrop.cc', 'mailnesia.com', 'moakt.com', 'tempinbox.com', 'emailondeck.com',
  'spamgourmet.com', 'mytemp.email', 'inboxbear.com', 'burnermail.io', '33mail.com',
  'mohmal.com', 'tempr.email', 'discard.email', 'spambog.com', 'mailcatch.com',
])

export const isDisposableDomain = (email) => {
  const domain = email.split('@')[1]?.toLowerCase().trim()
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false
}

// Confirms the domain actually has mail servers configured — this is what
// catches "asdf@asdfgh.com"-style made-up domains that pass the regex but
// can never receive a real verification email. Fails OPEN (lets the domain
// through) on anything except a confirmed "this domain doesn't exist" so a
// slow/flaky DNS resolver never blocks a legitimate signup.
export const domainCanReceiveMail = async (email) => {
  const domain = email.split('@')[1]?.toLowerCase().trim()
  if (!domain) return false

  const withTimeout = (promise) => Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('DNS_TIMEOUT')), 4000)),
  ])

  try {
    const records = await withTimeout(dns.promises.resolveMx(domain))
    if (records?.length) return true
  } catch (err) {
    if (err.code !== 'ENOTFOUND' && err.code !== 'ENODATA') return true // transient — don't block
  }

  // A few legitimate domains skip MX and rely on an A/AAAA record instead
  try {
    await withTimeout(dns.promises.resolve(domain))
    return true
  } catch (err) {
    if (err.code === 'ENOTFOUND') return false // domain genuinely doesn't exist
    return true // transient — don't block
  }
}
