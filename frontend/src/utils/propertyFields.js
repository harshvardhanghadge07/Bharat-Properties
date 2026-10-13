export const normalizePropertyType = (type) => ({ BUNGALOW: 'VILLA', FLAT: 'APARTMENT', INDEPENDENT_HOUSE: 'VILLA', LAND: 'PLOT' }[type] || type)

const number = (label, min = 0, step = '1') => ({ label, type: 'number', min, step })
const select = (label, options) => ({ label, type: 'select', options })
const text = (label) => ({ label, type: 'text', maxLength: 120 })
export const LAND_AREA_UNITS = { Acres: 43560, Hectares: 10000 / (0.3048 ** 2), Guntha: 1089 }
export const DETAIL_FIELDS = {
  carpetAreaSqft: number('Carpet area (sq.ft)', 0.01, 'any'),
  plotAreaSqft: number('Plot area (sq.ft)', 0.01, 'any'),
  builtUpAreaSqft: number('Built-up area (sq.ft)', 0.01, 'any'),
  plotLengthFt: number('Plot length (ft)', 0.01, 'any'),
  plotWidthFt: number('Plot width (ft)', 0.01, 'any'),
  roadWidthFt: number('Access road width (ft)', 0.01, 'any'),
  floorNumber: number('Floor number'),
  totalFloors: number('Total floors', 1),
  parkingSpaces: number('Parking spaces'),
  roomCount: number('Number of rooms', 1),
  bedCapacity: number('Bed capacity', 1),
  ceilingHeightFt: number('Clear ceiling height (ft)', 0.01, 'any'),
  furnishing: select('Furnishing', ['Unfurnished', 'Semi-furnished', 'Furnished']),
  facing: select('Facing', ['North', 'South', 'East', 'West', 'North East', 'North West', 'South East', 'South West']),
  landUse: select('Land use', ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Mixed use']),
  boundaryWall: select('Boundary / fencing', ['Yes', 'No', 'Partial']),
  waterSupply: select('Water supply', ['Municipal', 'Borewell', 'Well', 'Tanker', 'Multiple sources', 'None']),
  electricity: select('Electricity connection', ['Available', 'Not available']),
  loadingAccess: select('Loading vehicle access', ['Small vehicles', 'Trucks', 'Containers', 'None']),
  naStatus: select('NA (non-agricultural) status', ['Approved', 'Not approved', 'Application pending', 'Not applicable', 'Not known']),
  plotType: select('Plot type', ['Residential', 'Commercial']),
  floorLevel: select('Floor level', ['Ground floor', 'Upper floor', 'Basement']),
  liftAvailability: select('Lift availability', ['Available', 'Not available']),
  landArea: number('Land area', 0.000001, 'any'),
  landAreaUnit: select('Land area unit', Object.keys(LAND_AREA_UNITS)),
  village: text('Village'),
  taluka: text('Taluka'),
  district: text('District'),
  surveyNumber: text('Survey number / Gat number'),
  roadFrontageFt: number('Road frontage (ft)', 0.01, 'any'),
  roadAccess: select('Road access', ['Direct public road', 'Private access road', 'Right of way', 'No road access', 'Not known']),
}
const home = ['furnishing', 'parkingSpaces', 'facing']
export const PROPERTY_CONFIG = {
  APARTMENT: { areaLabel: 'Built-up area (sq.ft)', bedrooms: true, bathrooms: true, roomsRequired: true, details: ['carpetAreaSqft', 'floorNumber', 'totalFloors', ...home] },
  VILLA: { areaLabel: 'Built-up area (sq.ft)', bedrooms: true, bathrooms: true, roomsRequired: true, details: ['plotAreaSqft', 'totalFloors', ...home] },
  ROW_HOUSE: { areaLabel: 'Built-up area (sq.ft)', bedrooms: true, bathrooms: true, roomsRequired: true, details: ['plotAreaSqft', 'totalFloors', ...home, 'naStatus'] },
  PENTHOUSE: { areaLabel: 'Built-up area (sq.ft)', bedrooms: true, bathrooms: true, roomsRequired: true, details: ['floorNumber', 'totalFloors', ...home] },
  PLOT: { areaLabel: 'Plot / land area (sq.ft)', details: ['plotLengthFt', 'plotWidthFt', 'roadWidthFt', 'landUse', 'facing', 'boundaryWall', 'waterSupply', 'electricity', 'plotType', 'naStatus'] },
  INDUSTRIAL_LAND: { areaLabel: 'Land area (sq.ft)', details: ['plotLengthFt', 'plotWidthFt', 'roadWidthFt', 'boundaryWall', 'waterSupply', 'electricity'] },
  FARMHOUSE: { areaLabel: 'Total land area (sq.ft)', bedrooms: true, bathrooms: true, hint: 'Enter the total land area above. Add the house area and rooms only if a house is built on the land.', details: ['builtUpAreaSqft', 'roadWidthFt', 'boundaryWall', 'waterSupply', 'electricity', 'parkingSpaces'] },
  COMMERCIAL: { areaLabel: 'Built-up area (sq.ft)', bathrooms: true, details: ['floorNumber', 'totalFloors', 'furnishing', 'parkingSpaces'] },
  SHOP_SHOWROOM: { areaLabel: 'Shop / showroom area (sq.ft)', bathrooms: true, details: ['floorNumber', 'furnishing', 'parkingSpaces', 'roadWidthFt', 'carpetAreaSqft', 'builtUpAreaSqft', 'floorLevel', 'liftAvailability'] },
  WAREHOUSE: { areaLabel: 'Covered storage area (sq.ft)', bathrooms: true, details: ['plotAreaSqft', 'ceilingHeightFt', 'loadingAccess', 'roadWidthFt', 'electricity'] },
  PG_HOSTEL: { areaLabel: 'Built-up area (sq.ft)', bathrooms: true, details: ['roomCount', 'bedCapacity', 'totalFloors', 'furnishing', 'parkingSpaces'] },
  HOTEL_RESORT: { areaLabel: 'Built-up area (sq.ft)', bathrooms: true, details: ['roomCount', 'plotAreaSqft', 'totalFloors', 'furnishing', 'parkingSpaces'] },
  OFFICE_SPACE: { areaLabel: 'Built-up area (sq.ft)', bathrooms: true, details: ['carpetAreaSqft', 'floorNumber', 'totalFloors', 'parkingSpaces', 'liftAvailability', 'furnishing'] },
  COMMERCIAL_BUILDING: { areaLabel: 'Built-up area (sq.ft)', bathrooms: true, details: ['plotAreaSqft', 'totalFloors', 'parkingSpaces', 'liftAvailability'] },
  AGRICULTURAL_LAND: { areaLabel: 'Land area', areaUnits: true, details: ['landArea', 'landAreaUnit', 'village', 'taluka', 'district', 'surveyNumber', 'roadFrontageFt', 'roadAccess', 'landUse'] },
}
export const getPropertyConfig = (type) => PROPERTY_CONFIG[normalizePropertyType(type)] || PROPERTY_CONFIG.APARTMENT

export const propertyPayload = (form) => {
  const config = getPropertyConfig(form.type)
  const details = {}
  for (const key of config.details) {
    const value = form.details?.[key]
    if (value !== '' && value !== undefined && value !== null) {
      details[key] = DETAIL_FIELDS[key].type === 'number' ? Number(value) : value
    }
  }
  return {
    ...form, type: normalizePropertyType(form.type), details,
    price: Number(form.price), areaSqft: config.areaUnits ? Number(details.landArea) * LAND_AREA_UNITS[details.landAreaUnit] : Number(form.areaSqft),
    bedrooms: config.bedrooms && form.bedrooms !== '' && form.bedrooms != null ? Number(form.bedrooms) : null,
    bathrooms: config.bathrooms && form.bathrooms !== '' && form.bathrooms != null ? Number(form.bathrooms) : null,
  }
}

export const normalizeWhatsApp = (value) => {
  if (typeof value !== 'string' || !/^[+\d\s()-]*$/.test(value)) return ''
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  else if (digits.length === 10 && !value.trim().startsWith('+')) digits = `91${digits}`
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : ''
}
