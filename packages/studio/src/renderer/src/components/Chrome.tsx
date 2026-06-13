import { useSetting } from '../store'
import { TitleBarB } from './TitleBarB'
import { TitleBarC } from './TitleBarC'

// Titlebar variant is now the `titlebar.variant` setting (D36) — reactive: changing
// the setting re-renders the chrome live. Default 'C' (two-tier).
export function Chrome() {
  const variant = useSetting<'B' | 'C'>('titlebar.variant')
  return variant === 'B' ? <TitleBarB /> : <TitleBarC />
}
