export function validateTicket(idNumber, numbers) {
  if (!idNumber || idNumber.length === 0 || idNumber.length > 20)
    return 'Neispravan broj osobne iskaznice ili putovnice.';

  if (!numbers || numbers.length < 6 || numbers.length > 10)
    return 'Broj odabranih brojeva mora biti između 6 i 10.';

  const unique = new Set(numbers);
  if (unique.size !== numbers.length)
    return 'Brojevi se ne smiju ponavljati.';

  for (const n of numbers) {
    if (isNaN(n) || n < 1 || n > 45)
      return 'Brojevi moraju biti između 1 i 45.';
  }

  return null;
}
