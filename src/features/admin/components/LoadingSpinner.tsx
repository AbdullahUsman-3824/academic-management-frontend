interface Props {
  /** Size in pixels. Default: 32 */
  size?: number;
  /** Optional label shown below the spinner */
  label?: string;
  /** Whether to centre inside a card-body block */
  padded?: boolean;
}

/**
 * Simple CSS-only spinner for loading states.
 */
export function LoadingSpinner({ size = 32, label, padded = true }: Props) {
  const content = (
    <div className="spinner-wrap">
      <span
        className="spinner"
        style={{ width: size, height: size }}
        role="status"
        aria-label={label ?? "Loading…"}
      />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );

  if (padded) {
    return <div className="card-body">{content}</div>;
  }

  return content;
}
