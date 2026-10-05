import { useId } from 'react'

export default function Field({ label, error, as = 'input', children, ...props }) {
  const id = useId()
  const Tag = as
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <Tag id={id} className="input" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-err` : undefined} {...props}>
        {children}
      </Tag>
      {error && <p id={`${id}-err`} className="field-error">{error}</p>}
    </div>
  )
}
