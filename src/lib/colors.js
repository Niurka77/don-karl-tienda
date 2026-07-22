const COLOR_MAP = {
  negro: '#111111',
  blanco: '#F8F8F8',
  rojo: '#C0392B',
  rosa: '#E87D8F',
  dorado: '#C9A84C',
  plateado: '#B0B0B0',
  azul: '#2C5F8A',
  verde: '#2E7D32',
  beige: '#D4C5A9',
  marron: '#6D4C41',
  gris: '#78909C',
  amarillo: '#F9A825',
  naranja: '#E64A19',
  morado: '#6A1B9A',
  vino: '#6D1F2E',
  turquesa: '#00897B',
}

export const getColorHex = (name) =>
  COLOR_MAP[name?.toLowerCase()] ?? '#D4788A'
