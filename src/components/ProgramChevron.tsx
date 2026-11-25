export function ProgramChevron({ direction = 'left' }: { direction?: 'left' | 'right' }) {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M8 3.75 3.75 8 8 12.25" transform={direction === 'right' ? 'rotate(180 8 8)' : undefined}
        stroke="currentColor" strokeWidth="1.56" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

