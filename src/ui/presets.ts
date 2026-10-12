import type { PresetId } from '../sim/types'

/** Grey-box colours for the four presets; shared by the HUD avatar and the 3D player. */
export const PRESET_LOOK: Record<PresetId, { shirt: string; headwear: string; skin: string }> = {
  hat: { shirt: '#4c6a8a', headwear: '#e2c27a', skin: '#d9a97c' },
  cap: { shirt: '#c26b3a', headwear: '#3d6a9e', skin: '#c99068' },
  scarf: { shirt: '#6d8a4a', headwear: '#d98aa0', skin: '#e0b48c' },
  bun: { shirt: '#d8c08a', headwear: '#2e2622', skin: '#c99068' },
}
