import geometry from '../../assets/program/catalog-lettering.json'

const sprites = import.meta.glob<string>('../../assets/program/lettering-*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
})

export function ProgramLettering({ system, variant, label }: {
  system: string
  variant: 'catalog' | 'detail' | number
  label: string
}) {
  const id = system + '-' + variant
  const size = (geometry as Partial<Record<string, number[]>>)[id]
  const sprite = sprites['../../assets/program/lettering-' + (variant === 'catalog' ? 'catalog' : system) + '.svg']
  if (!size || !sprite) return <span lang="en" dir="ltr">{label}</span>

  const [width, height] = size
  return (
    <svg role="img" aria-label={label} lang="en"
      width={width} height={height} viewBox={'0 0 ' + width + ' ' + height}>
      <use href={sprite + '#' + id} width={width} height={height} />
    </svg>
  )
}
