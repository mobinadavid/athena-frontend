/** Iranian national identity code: 8–10 digits with official checksum. */
export function isValidNationalIdentityCode(value: string): boolean {
  if (!/^\d{8,10}$/.test(value)) return false;
  if (/^(\d)\1{9}$/.test(value.padStart(10, "0"))) return false;

  const padded = value.padStart(10, "0");
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(padded[i]) * (10 - i);
  }

  const remainder = sum % 11;
  const control = remainder < 2 ? remainder : 11 - remainder;
  return control === Number(padded[9]);
}

export function isValidIranianMobile(value: string): boolean {
  return /^09[0-9]{9}$/.test(value);
}

export function isStrongPassword(value: string): boolean {
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}
