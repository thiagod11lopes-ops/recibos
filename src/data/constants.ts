export const LOCAL_STORAGE_KEY = 'recibos-contract-document'

const PAID_UP_TO = 18

export const INITIAL_PAID_NUMBERS = Array.from(
  { length: PAID_UP_TO },
  (_, index) => index + 1,
)
