// Suggested SDR++ settings for a signal. The SDR can't detect modulation on its
// own, so these are derived from the signal's stored mode + frequency (MHz).

export interface SdrSettings {
  demod: string
  bandwidthKhz: number
  squelch: boolean
  notes: string[]
}

// R820T2 tuner (Nooelec NESDR) lower limit without direct sampling/upconverter
const RTL_SDR_MIN_MHZ = 24

export function getSdrSettings(frequency: number, mode: string): SdrSettings {
  const isBroadcastFm = frequency >= 88 && frequency <= 108
  let settings: SdrSettings

  switch (mode.toUpperCase()) {
    case 'AM':
      settings = { demod: 'AM', bandwidthKhz: 8, squelch: true, notes: [] }
      break
    case 'NFM':
      settings = { demod: 'NFM', bandwidthKhz: 12.5, squelch: true, notes: [] }
      break
    case 'FM':
    case 'WFM':
      settings = isBroadcastFm
        ? { demod: 'WFM', bandwidthKhz: 200, squelch: false, notes: [] }
        : { demod: 'NFM', bandwidthKhz: 15, squelch: true, notes: [] }
      break
    case 'USB':
    case 'LSB':
      settings = { demod: mode.toUpperCase(), bandwidthKhz: 3, squelch: false, notes: [] }
      break
    default:
      settings = { demod: mode, bandwidthKhz: 12.5, squelch: true, notes: [] }
  }

  if (settings.squelch) {
    settings.notes.push('Transmissions are intermittent — raise squelch until the static between them goes quiet')
  }
  if (frequency < RTL_SDR_MIN_MHZ) {
    settings.notes.push(`Below RTL-SDR range (~${RTL_SDR_MIN_MHZ} MHz) — needs direct sampling or an upconverter`)
  }
  if (frequency >= 118 && frequency <= 137) {
    settings.notes.push('Airband: use an antenna cut for ~128 MHz (≈56 cm quarter-wave), mounted high')
  }

  return settings
}
