import './Loading.css';

/**
 * Loading spinner component
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size (small, medium, large)
 * @param {string} props.color - Spinner color
 * @param {string} props.label - Accessibility label
 * @param {boolean} props.fullScreen - Whether to show full screen overlay
 */
export const Loading = ({
  size = 'medium',
  color = 'primary',
  label = 'Loading...',
  fullScreen = false,
}) => {
  const spinner = (
    <div 
      className={`loading-spinner loading-spinner-${size} loading-spinner-${color}`}
      role="status"
      aria-label={label}
    >
      <span className="loading-spinner-inner"></span>
      <span className="loading-spinner-label">{label}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Loading skeleton component for content placeholders
 * @param {Object} props - Component props
 * @param {number} props.count - Number of skeleton items to show
 * @param {string} props.type - Skeleton type (text, card, list)
 * @param {string} props.className - Additional CSS class
 */
export const LoadingSkeleton = ({
  count = 1,
  type = 'text',
  className = '',
}) => {
  const skeletons = [];

  for (let i = 0; i < count; i++) {
    skeletons.push(
      <div key={i} className={`skeleton skeleton-${type} ${className}`} />
    );
  }

  return <>{skeletons}</>;
};

export default Loading;