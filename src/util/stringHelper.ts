export async function generateRandomString(length: number = 62): Promise<string> {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

export async function convertStringToMulticase(stringToConvert: string): Promise<string> {
  let result = '';
  let toggle = true;
  for (const char of stringToConvert.toString()) {
    if (/[a-zA-Z]/.test(char)) {
      result += toggle ? char.toUpperCase() : char.toLowerCase();
      toggle = !toggle; // Flip case for next letter
    } else {
      // Non-alphabetic characters remain unchanged
      result += char;
    }
  }
  return result;
}
