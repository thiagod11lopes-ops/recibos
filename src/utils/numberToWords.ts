const units = [
  '',
  'um',
  'dois',
  'três',
  'quatro',
  'cinco',
  'seis',
  'sete',
  'oito',
  'nove',
  'dez',
  'onze',
  'doze',
  'treze',
  'quatorze',
  'quinze',
  'dezesseis',
  'dezessete',
  'dezoito',
  'dezenove',
]

const tens = [
  '',
  '',
  'vinte',
  'trinta',
  'quarenta',
  'cinquenta',
  'sessenta',
  'setenta',
  'oitenta',
  'noventa',
]

const hundreds = [
  '',
  'cento',
  'duzentos',
  'trezentos',
  'quatrocentos',
  'quinhentos',
  'seiscentos',
  'setecentos',
  'oitocentos',
  'novecentos',
]

function convertHundreds(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'cem'

  const h = Math.floor(n / 100)
  const remainder = n % 100
  const parts: string[] = []

  if (h > 0) parts.push(hundreds[h])

  if (remainder > 0) {
    if (remainder < 20) {
      parts.push(units[remainder])
    } else {
      const t = Math.floor(remainder / 10)
      const u = remainder % 10
      parts.push(u > 0 ? `${tens[t]} e ${units[u]}` : tens[t])
    }
  }

  return parts.join(' e ')
}

function convertInteger(n: number): string {
  if (n === 0) return 'zero'

  const parts: string[] = []

  const millions = Math.floor(n / 1_000_000)
  const thousands = Math.floor((n % 1_000_000) / 1000)
  const remainder = n % 1000

  if (millions > 0) {
    parts.push(
      millions === 1 ? 'um milhão' : `${convertHundreds(millions)} milhões`,
    )
  }

  if (thousands > 0) {
    parts.push(thousands === 1 ? 'mil' : `${convertHundreds(thousands)} mil`)
  }

  if (remainder > 0) {
    parts.push(convertHundreds(remainder))
  }

  return parts.join(', ').replace(', mil', ' mil')
}

export function numberToWords(value: number): string {
  const reais = Math.floor(value)
  const centavos = Math.round((value - reais) * 100)

  let result = convertInteger(reais)
  result += reais === 1 ? ' real' : ' reais'

  if (centavos > 0) {
    result += ` e ${convertInteger(centavos)}`
    result += centavos === 1 ? ' centavo' : ' centavos'
  }

  return result
}
