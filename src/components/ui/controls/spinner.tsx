const SPINNER_ANGLE = 80
const SPINNER_RADIUS = 10
const SPINNER_MASK_RATIO = 0.7

type Variant = 'default' | 'button' | 'inverted-card-button'

export interface SpinnerProps {
  readonly variant?: Variant
}

const spinnerColor = (variant: Variant) => {
  switch (variant) {
    case 'default':
      return 'var(--color-semantic-info)'
    case 'button':
      return 'var(--color-grays-000)'
    case 'inverted-card-button':
      return 'var(--color-brand-2-500)'
  }
}

const Spinner = ({ variant = 'default' }: SpinnerProps) => (
  <svg
    width={2 * SPINNER_RADIUS}
    height={2 * SPINNER_RADIUS}
    viewBox={`${-SPINNER_RADIUS} ${-SPINNER_RADIUS} ${2 * SPINNER_RADIUS} ${2 * SPINNER_RADIUS}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Loading..."
  >
    <mask id="spinner">
      <rect
        fill="rgba(255,255,255,0.1)"
        x={-SPINNER_RADIUS}
        y={-SPINNER_RADIUS}
        width={2 * SPINNER_RADIUS}
        height={2 * SPINNER_RADIUS}
      />
      <path
        fill="white"
        d={`
			M 0,0
			V ${-SPINNER_RADIUS}
			A ${SPINNER_RADIUS},${SPINNER_RADIUS},0,0,1,${SPINNER_RADIUS * Math.cos(((SPINNER_ANGLE - 90) * Math.PI) / 180)},${SPINNER_RADIUS * Math.sin(((SPINNER_ANGLE - 90) * Math.PI) / 180)}
			Z
		`}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0"
          to="360"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
      <circle fill="black" r={SPINNER_MASK_RATIO * SPINNER_RADIUS} />
    </mask>
    <circle r={SPINNER_RADIUS} fill={spinnerColor(variant)} mask="url(#spinner)" />
  </svg>
)

export default Spinner
