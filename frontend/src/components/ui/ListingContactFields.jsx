export default function ListingContactFields({ form, setForm, email }) {
  return <fieldset className="rounded-xl border border-gray-200 p-4 space-y-3">
    <legend className="text-sm font-semibold text-gray-800 px-1">Lister contact details</legend>
    <label className="block text-sm text-gray-700">WhatsApp number
      <input type="tel" autoComplete="tel" className="input-field" value={form.whatsappNumber ?? ''} onChange={(event) => setForm((old) => ({ ...old, whatsappNumber: event.target.value }))} placeholder="e.g. +91 98765 43210" maxLength={30} />
    </label>
    <p className="text-xs text-gray-500">Buyers will message this number directly. Include the country code for numbers outside India. Leave blank to hide WhatsApp contact.</p>
    <p className="text-sm text-gray-700">Email inquiries go to {email ? <strong>{email}</strong> : 'the listing owner’s login email'}.</p>
    <p className="text-xs text-gray-500">The email recipient is linked automatically to the owner’s account.</p>
  </fieldset>
}
