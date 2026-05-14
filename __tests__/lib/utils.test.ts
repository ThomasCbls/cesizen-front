import { cn } from '@/lib/utils'

describe('cn (class merger)', () => {
  it('retourne une chaîne vide sans arguments', () => {
    expect(cn()).toBe('')
  })

  it('retourne la classe fournie', () => {
    expect(cn('text-red-500')).toBe('text-red-500')
  })

  it('concatène plusieurs classes', () => {
    expect(cn('flex', 'items-center', 'gap-4')).toBe('flex items-center gap-4')
  })

  it('ignore les valeurs falsy (undefined, false, null)', () => {
    expect(cn('flex', undefined, false, null, 'gap-2')).toBe('flex gap-2')
  })

  it('fusionne les classes Tailwind conflictuelles (tailwind-merge)', () => {
    // tailwind-merge déduplique p-2 vs p-4 et garde le dernier
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('gère les objets conditionnels', () => {
    expect(cn({ 'text-bold': true, 'text-italic': false })).toBe('text-bold')
  })

  it('gère les tableaux de classes', () => {
    expect(cn(['flex', 'items-center'])).toBe('flex items-center')
  })

  it('fusionne correctement px et padding générique', () => {
    expect(cn('px-2', 'px-6')).toBe('px-6')
  })
})
