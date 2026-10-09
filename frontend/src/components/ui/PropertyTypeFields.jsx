import { PROPERTY_TYPES, TYPE_LABELS } from '../../utils/helpers'
import { DETAIL_FIELDS, getPropertyConfig } from '../../utils/propertyFields'

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
      <label className="block text-sm text-gray-700">{config.areaLabel} *<input {...input('areaSqft')} type="number" required min="0.01" step="any" /></label>
      {config.bedrooms && <label className="block text-sm text-gray-700">Bedrooms{config.roomsRequired ? ' *' : ''}<input {...input('bedrooms')} type="number" min="0" step="1" required={config.roomsRequired} placeholder="0 for studio / no bedroom" /></label>}
      {config.bathrooms && <label className="block text-sm text-gray-700">Bathrooms / washrooms{config.roomsRequired ? ' *' : ''}<input {...input('bathrooms')} type="number" min={config.roomsRequired ? 1 : 0} step="1" required={config.roomsRequired} /></label>}
      {config.details.map((key) => {
        const field = DETAIL_FIELDS[key]
        const props = { className: 'input-field', value: form.details?.[key] ?? '', onChange: (event) => setForm((old) => ({ ...old, details: { ...old.details, [key]: event.target.value } })) }
        return <label key={key} className="block text-sm text-gray-700">{field.label}
          {field.type === 'select' ? <select {...props}><option value="">Select (optional)</option>{field.options.map((option) => <option key={option}>{option}</option>)}</select> : <input {...props} type="number" min={field.min} step={field.step} />}
        </label>
      })}
    </div>
  </fieldset>
}
