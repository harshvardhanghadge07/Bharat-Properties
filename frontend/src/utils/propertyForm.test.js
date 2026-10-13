import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { buildSync } from 'esbuild'
import { PROPERTY_CONFIG } from './propertyFields.js'

const bundle = buildSync({
  entryPoints: [fileURLToPath(new URL('../components/ui/PropertyTypeFields.jsx', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic', packages: 'external',
})
const module = { exports: {} }
new Function('require', 'module', 'exports', bundle.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports)
const PropertyTypeFields = module.exports.default
const descendants = (node) => {
  if (!node || typeof node !== 'object') return []
  if (Array.isArray(node)) return node.flatMap(descendants)
  return [node, ...descendants(node.props?.children)]
}

test('every property type shows one required positive price input and retains price on type changes', () => {
  let form = { type: 'APARTMENT', price: '5000000', details: {}, bedrooms: '2', bathrooms: '1' }
  const render = () => descendants(PropertyTypeFields({ form, setForm: (update) => { form = update(form) } }))
  for (const type of Object.keys(PROPERTY_CONFIG)) {
    render().find((node) => node.type === 'select' && node.props.name === 'type').props.onChange({ target: { value: type } })
    const prices = render().filter((node) => node.type === 'input' && node.props.name === 'price')
    assert.equal(prices.length, 1, type)
    assert.equal(prices[0].props.required, true, type)
    assert.ok(Number(prices[0].props.min) > 0, type)
    assert.equal(prices[0].props.value, '5000000', type)
  }
})

test('agricultural area units preserve the physical land area when switched', () => {
  let form = { type: 'AGRICULTURAL_LAND', price: '5000000', details: { landArea: '2', landAreaUnit: 'Acres' } }
  const render = () => descendants(PropertyTypeFields({ form, setForm: (update) => { form = update(form) } }))
  assert.equal(render().filter((node) => node.type === 'input' && node.props.name === 'areaSqft').length, 0)
  assert.equal(render().find((node) => node.type === 'input' && node.props.name === 'landArea').props.required, true)
  render().find((node) => node.type === 'select' && node.props.name === 'landAreaUnit').props.onChange({ target: { value: 'Guntha' } })
  assert.equal(form.details.landArea, 80)
  render().find((node) => node.type === 'select' && node.props.name === 'landAreaUnit').props.onChange({ target: { value: 'Acres' } })
  assert.equal(form.details.landArea, 2)
  assert.equal(form.price, '5000000')
})

test('PDF-only fields appear for their relevant types and identifiers remain text', () => {
  const fields = (type) => descendants(PropertyTypeFields({ form: { type, details: {} }, setForm: () => {} })).filter((node) => ['input', 'select'].includes(node.type))
  for (const [type, names] of Object.entries({ APARTMENT: ['carpetAreaSqft'], ROW_HOUSE: ['naStatus'], PLOT: ['plotType', 'naStatus'], SHOP_SHOWROOM: ['carpetAreaSqft', 'builtUpAreaSqft', 'floorLevel', 'liftAvailability'], OFFICE_SPACE: ['carpetAreaSqft', 'floorNumber', 'totalFloors', 'parkingSpaces', 'liftAvailability'], COMMERCIAL_BUILDING: ['plotAreaSqft', 'totalFloors', 'parkingSpaces', 'liftAvailability'] })) {
    for (const name of names) assert.ok(fields(type).some((node) => node.props.name === name), `${type}: ${name}`)
  }
  assert.equal(fields('AGRICULTURAL_LAND').find((node) => node.props.name === 'surveyNumber').props.type, 'text')
  assert.equal(fields('FARMHOUSE').some((node) => node.props.name === 'surveyNumber'), false)
})
