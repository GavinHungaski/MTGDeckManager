import './Button.css';

/**
 * Reusable Button component with variants and sizes
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant (primary, secondary, danger, ghost)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS class
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.ariaLabel - Accessibility label
 */
export const Button = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
  children,
  ariaLabel,
  ...props
}) => {
  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    className,
    loading ? 'btn-loading' : '',
    disabled ? 'btn-disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn-spinner" aria-hidden="true"></span>
          <span className="btn-loading-text">Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;