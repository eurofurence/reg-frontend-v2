export const sanitizeSingleLine = (value: string) => value.replace(/[\r\n]+/gu, '').trim()
