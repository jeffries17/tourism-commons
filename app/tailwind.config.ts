import type { Config } from 'tailwindcss'
import uiConfig from '@tourism-commons/ui/tailwind.config'

const config: Config = {
  presets: [uiConfig],
  content: [
    './app/**/*.{ts,tsx}',
    '../packages/ui/**/*.{ts,tsx}',
  ],
}

export default config
