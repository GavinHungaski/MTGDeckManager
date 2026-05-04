import { forwardRef } from 'react';
import './Input.css';

/**
 * Reusable Input component with label and error display
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.error - Error message to display
 * @param {boolean} props.required - Whether input is required
 * @param {string} props.name - Input name attribute
 * @param {string} props.className - Additional CSS class
 * @param {string} props.autoComplete - Autocomplete attribute
 * @param {string} props.ariaLabel - Accessibility label
 */
export const Input = forwardRef(({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  required = false,
  name,
  className = '',
  autoComplete,
  ariaLabel,
  ...props
}, ref) => {
  const inputId = name || label?.toLowerCase().replace(/\s+/g, '-') || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`input-group ${className} ${error ? 'input-group-error' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        name={name}
        autoComplete={autoComplete}
        aria-label={ariaLabel || label}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className="input-field"
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="input-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;