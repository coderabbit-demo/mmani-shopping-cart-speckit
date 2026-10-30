function channels(color: string): number[] {
  const value = color.trim();
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value);
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((digit) => digit + digit).join("") : hex[1];
    return [0, 2, 4].map((offset) => parseInt(digits.slice(offset, offset + 2), 16));
  }
  const rgb = /^rgb\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)$/i.exec(value);
  if (rgb) {
    const values = rgb.slice(1).map(Number);
    if (values.every((channel) => channel <= 255)) return values;
  }
  throw new Error(`Unsupported color: ${color}`);
}

export function relativeLuminance(color: string): number {
  const [red, green, blue] = channels(color).map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(first: string, second: string): number {
  const luminances = [relativeLuminance(first), relativeLuminance(second)];
  return (Math.max(...luminances) + 0.05) / (Math.min(...luminances) + 0.05);
}

export function meetsAA(ratio: number, { largeText = false }: { largeText?: boolean } = {}): boolean {
  return ratio >= (largeText ? 3 : 4.5);
}
