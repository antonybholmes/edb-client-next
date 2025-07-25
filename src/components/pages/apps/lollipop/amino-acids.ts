import { COLOR_BLACK } from '@/lib/color/color'

export const AMINO_ACIDS: string[] = [
  'A',
  'R',
  'N',
  'D',
  'C',
  'Q',
  'E',
  'G',
  'H',
  'I',
  'L',
  'K',
  'M',
  'F',
  'P',
  'S',
  'T',
  'W',
  'Y',
  'V',
  'X', // X for unknown or any amino acid
] as const

export const AMINO_ACID_FULL_NAMES: Record<string, string> = {
  A: 'Alanine',
  R: 'Arginine',
  N: 'Asparagine',
  D: 'Aspartate',
  C: 'Cysteine',
  Q: 'Glutamine',
  E: 'Glutamate',
  G: 'Glycine',
  H: 'Histidine',
  I: 'Isoleucine',
  L: 'Leucine',
  K: 'Lysine',
  M: 'Methionine',
  F: 'Phenylalanine',
  P: 'Proline',
  S: 'Serine',
  T: 'Threonine',
  W: 'Tryptophan',
  Y: 'Tyrosine',
  V: 'Valine',
  X: 'Unknown',
}

export const AMINO_ACID_SHORT_NAMES: Record<string, string> = {
  A: 'Ala',
  R: 'Arg',
  N: 'Asn',
  D: 'Asp',
  C: 'Cys',
  Q: 'Gln',
  E: 'Glu',
  G: 'Gly',
  H: 'His',
  I: 'Ile',
  L: 'Leu',
  K: 'Lys',
  M: 'Met',
  F: 'Phe',
  P: 'Pro',
  S: 'Ser',
  T: 'Thr',
  W: 'Trp',
  Y: 'Tyr',
  V: 'Val',
  X: 'Unk',
}

export type AminoAcid = (typeof AMINO_ACIDS)[number]

export function toAA(amino: string): string {
  return amino
    .toUpperCase()
    .split('')
    .map(a => (AMINO_ACIDS.includes(a) ? a : 'X'))
    .join('')
}

export const AA_RASMOL_COLORS: Record<AminoAcid, string> = {
  A: '#C8C8C8', // Alanine – dark gray
  R: '#145AFF', // Arginine – blue
  N: '#00DCDC', // Asparagine – cyan
  D: '#E60A0A', // Aspartate – bright red
  C: '#E6E600', // Cysteine – yellow
  Q: '#00DCDC', // Glutamine – cyan
  E: '#E60A0A', // Glutamate – bright red
  G: '#EBEBEB', // Glycine – light gray
  H: '#8282D2', // Histidine – pale blue
  I: '#0F820F', // Isoleucine – green
  L: '#0F820F', // Leucine – green
  K: '#145AFF', // Lysine – blue
  M: '#E6E600', // Methionine – yellow
  F: '#3232AA', // Phenylalanine – mid‑blue
  P: '#DC9682', // Proline – flesh
  S: '#FA9600', // Serine – orange
  T: '#FA9600', // Threonine – orange
  W: '#B45AB4', // Tryptophan – pink
  Y: '#3232AA', // Tyrosine – mid‑blue
  V: '#0F820F', // Valine – green
  X: COLOR_BLACK, // Unknown or any amino acid – black
}

export const AA_SHAPELY_COLORS: Record<AminoAcid, string> = {
  A: '#8CFF8C', // Alanine – medium green :contentReference[oaicite:1]{index=1}
  R: '#00007C', // Arginine – dark blue :contentReference[oaicite:2]{index=2}
  N: '#FF7C70', // Asparagine – light salmon :contentReference[oaicite:3]{index=3}
  D: '#A00042', // Aspartate – dark red / dark rose :contentReference[oaicite:4]{index=4}
  C: '#FFFF70', // Cysteine – medium yellow :contentReference[oaicite:5]{index=5}
  Q: '#FF4C4C', // Glutamine – dark salmon/orange :contentReference[oaicite:6]{index=6}
  E: '#660000', // Glutamate – dark brown :contentReference[oaicite:7]{index=7}
  G: '#FFFFFF', // Glycine – white :contentReference[oaicite:8]{index=8}
  H: '#7070FF', // Histidine – medium/pale blue :contentReference[oaicite:9]{index=9}
  I: '#004C00', // Isoleucine – dark green :contentReference[oaicite:10]{index=10}
  L: '#455E45', // Leucine – grey‑green / olive green :contentReference[oaicite:11]{index=11}
  K: '#4747B8', // Lysine – royal blue :contentReference[oaicite:12]{index=12}
  M: '#B8A042', // Methionine – light brown / dark yellow :contentReference[oaicite:13]{index=13}
  F: '#534C42', // Phenylalanine – olive grey (dark grey) :contentReference[oaicite:14]{index=14}
  P: '#525252', // Proline – dark grey :contentReference[oaicite:15]{index=15}
  S: '#FF7042', // Serine – medium orange :contentReference[oaicite:16]{index=16}
  T: '#B84C00', // Threonine – dark orange :contentReference[oaicite:17]{index=17}
  W: '#4F4600', // Tryptophan – olive brown (dark grey-ish) :contentReference[oaicite:18]{index=18}
  Y: '#8C704C', // Tyrosine – medium brown :contentReference[oaicite:19]{index=19}
  V: '#FFFFFF', // Valine – white :contentReference[oaicite:20]{index=20}
  X: COLOR_BLACK, // Unknown or any amino acid – black
}

export const AA_DNASTAR_COLORS: Record<AminoAcid, string> = {
  // Charged (acidic + basic)
  D: '#E60A0A',
  E: '#E60A0A', // red
  K: '#145AFF',
  R: '#145AFF', // blue

  // Polar uncharged
  N: '#00DCDC',
  Q: '#00DCDC', // cyan
  S: '#FA9600',
  T: '#FA9600', // orange
  H: '#8282D2', // pale blue

  // Hydrophobic
  A: '#C8C8C8',
  G: '#EBEBEB', // greys
  I: '#0F820F',
  L: '#0F820F',
  V: '#0F820F', // green
  F: '#3232AA',
  Y: '#3232AA', // mid‑blue
  W: '#B45AB4', // purple/pink
  C: '#E6E600',
  M: '#E6E600', // yellow
  P: '#DC9682', // flesh (hydrophobic)
  X: COLOR_BLACK, // Unknown or any amino acid – black
}

export type AAColorScheme = 'RasMol' | 'Shapely' //| 'DNASTAR'

export const AA_COLOR_SCHEMES: Record<
  AAColorScheme,
  Record<AminoAcid, string>
> = {
  RasMol: AA_RASMOL_COLORS,
  Shapely: AA_SHAPELY_COLORS,
  //DNASTAR: AA_DNASTAR_COLORS,
}

export const DEFAULT_AA_COLOR = COLOR_BLACK
