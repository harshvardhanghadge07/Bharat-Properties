import { PROPERTY_TYPES, TYPE_LABELS } from '../../utils/helpers'
import { DETAIL_FIELDS, getPropertyConfig, LAND_AREA_UNITS } from '../../utils/propertyFields'

export default function PropertyTypeFields({ form, setForm }) {
  const config = getPropertyConfig(form.type)
  const input = (key) => ({ name: key, value: form[key] ?? '', onChange: (event) => setForm((old) => ({ ...old, [key]: event.target.value })), className: 'input-field' })
  return <fieldset className="space-y-4">
    <legend className="text-sm font-semibold text-gray-800 mb-2">Property type and details</legend>
    <label className="block text-sm text-gray-700">Property type *
      <select {...input('type')} required onChange={(event) => {
        const type = event.target.value
        setForm((old) => ({ ...old, type, bedrooms: '', bathrooms: '', details: {} }))
      }}>
        {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{TYPE_LABELS[type]}</option>)}
      </select>
    </label>
    {config.hint && <p className="text-xs text-gray-500">{config.hint}</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="block text-sm text-gray-700">Price (₹) *<input {...input('price')} type="number" required min="0.01" step="any" placeholder="e.g. 5000000" /></label>
      {!config.areaUnits && <label className="block text-sm text-gray-700">{config.areaLabel} *<input {...input('areaSqft')} type="number" required min="0.01" step="any" /></label>}
      {config.bedrooms && <label className="block text-sm text-gray-700">Bedrooms{config.roomsRequired ? ' *' : ''}<input {...input('bedrooms')} type="number" min="0" step="1" required={config.roomsRequired} placeholder="0 for studio / no bedroom" /></label>}
      {config.bathrooms && <label className="block text-sm text-gray-700">Bathrooms / washrooms{config.roomsRequired ? ' *' : ''}<input {...input('bathrooms')} type="number" min={config.roomsRequired ? 1 : 0} step="1" required={config.roomsRequired} /></label>}
      {config.details.map((key) => {
        const field = DETAIL_FIELDS[key]
        const required = config.areaUnits && ['landArea', 'landAreaUnit'].includes(key)
        const props = { name: key, required, className: 'input-field', value: form.details?.[key] ?? '', onChange: (event) => setForm((old) => {
          const details = { ...old.details, [key]: event.target.value }
          if (key === 'landAreaUnit' && old.details?.landArea && LAND_AREA_UNITS[old.details.landAreaUnit] && LAND_AREA_UNITS[event.target.value]) {
            details.landArea = Number((Number(old.details.landArea) * LAND_AREA_UNITS[old.details.landAreaUnit] / LAND_AREA_UNITS[event.target.value]).toPrecision(12))
          }
          return { ...old, details }
        }) }
        return <label key={key} className="block text-sm text-gray-700">{field.label}{required ? ' *' : ''}
          {field.type === 'select' ? <select {...props}><option value="">{required ? 'Select unit' : 'Select (optional)'}</option>{field.options.map((option) => <option key={option}>{option}</option>)}</select> : <input {...props} type={field.type} min={field.min} step={field.step} maxLength={field.maxLength} />}
        </label>
      })}
    </div>
  </fieldset>
}
