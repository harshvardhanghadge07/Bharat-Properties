const invalid = (message) => Object.assign(new Error(message), { status: 400 })

import { PROPERTY_RULES, DETAIL_RULES, LAND_AREA_UNITS } from './propertyRules.js'

export const normalizePropertyType = (type) => ({ BUNGALOW: 'VILLA', FLAT: 'APARTMENT', INDEPENDENT_HOUSE: 'VILLA', LAND: 'PLOT' }[type] || type)
export const typeFilter = (type) => {
  const canonical = normalizePropertyType(type)
  const aliases = { APARTMENT: ['APARTMENT', 'FLAT'], VILLA: ['VILLA', 'BUNGALOW', 'INDEPENDENT_HOUSE'], PLOT: ['PLOT', 'LAND'] }
  return aliases[canonical] ? { $in: aliases[canonical] } : canonical
}
export const normalizeWhatsApp = (value) => {
  if (typeof value !== 'string' || !/^[+\d\s()-]*$/.test(value)) return ''
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  else if (digits.length === 10 && !value.trim().startsWith('+')) digits = `91${digits}`
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : ''
}

// Validate supplied values and remove fields that no longer apply after a type change.
export const prepareListing = (fields, existing = {}) => {
  const data = { ...fields }
  if ('whatsappNumber' in data) {
    if (typeof data.whatsappNumber !== 'string') throw invalid('Enter a valid WhatsApp number with country code.')
    const raw = data.whatsappNumber.trim()
    const digits = normalizeWhatsApp(raw)
    if (raw && !digits) throw invalid('Enter a valid WhatsApp number with country code.')
    // Preserve an explicit country code when a valid international number has ten digits.
    data.whatsappNumber = digits ? `+${digits}` : ''
  }
  if ('type' in data) data.type = normalizePropertyType(data.type)
  const config = PROPERTY_RULES[data.type || normalizePropertyType(existing.type)]
  if ('type' in data && !config) throw invalid('Choose a valid property type.')
  for (const key of ['price', 'areaSqft']) {
    if (key in data && (typeof data[key] !== 'number' || !Number.isFinite(data[key]) || data[key] <= 0)) throw invalid(`${key === 'price' ? 'Price' : 'Area'} must be greater than zero.`)
  }
  for (const key of ['bedrooms', 'bathrooms']) {
    if (config && !config[key]) { data[key] = null; continue }
    if (data[key] != null && (!Number.isInteger(data[key]) || data[key] < 0)) throw invalid(`${key} must be a whole number of zero or more.`)
    if (config?.roomsRequired && (key in data || 'type' in data)) {
      const value = key in data ? data[key] : existing[key]
      if (!Number.isInteger(value) || value < (key === 'bathrooms' ? 1 : 0)) throw invalid(`Enter ${key} for this property type.`)
    }
  }
  if ('details' in data || ('type' in data && data.type !== normalizePropertyType(existing.type))) {
    const details = data.details ?? {}
    if (typeof details !== 'object' || Array.isArray(details)) throw invalid('Invalid property details.')
    data.details = {}
    for (const key of config?.details || []) {
      const value = details[key]
      if (value == null || value === '') continue
      const rule = DETAIL_RULES[key]
      if (rule.type === 'number') {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < rule.min || (rule.step === '1' && !Number.isInteger(value))) throw invalid(`Enter a valid ${rule.label.toLowerCase()}.`)
      } else if (rule.type === 'text') {
        if (typeof value !== 'string' || value.trim().length > rule.maxLength) throw invalid(`Enter a valid ${rule.label.toLowerCase()} (up to ${rule.maxLength} characters).`)
      } else if (!rule.options.includes(value)) throw invalid(`Choose a valid ${rule.label.toLowerCase()}.`)
      data.details[key] = rule.type === 'text' ? value.trim() : value
    }
  }
  if (config?.areaUnits && ('details' in data || 'type' in data || 'areaSqft' in data)) {
    const details = data.details || existing.details || {}
    if (!Number.isFinite(details.landArea) || details.landArea <= 0 || !Object.hasOwn(LAND_AREA_UNITS, details.landAreaUnit)) throw invalid('Enter the agricultural land area and choose Acres, Hectares or Guntha.')
    // Store a canonical square-foot area for price comparisons; keep the selected unit for editing.
    data.areaSqft = details.landArea * LAND_AREA_UNITS[details.landAreaUnit]
    if (!Number.isFinite(data.areaSqft)) throw invalid('Enter a valid land area.')
  }
  return data
}
