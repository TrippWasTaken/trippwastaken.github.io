type Hex = string;
type Rgb = [r: number, g: number, b: number];
type Output = Hex | Rgb | (Hex | Rgb)[] | string;

export const lightOrDark = (color: Output): 'light' | 'dark' => {
  const colLen = color.length;
  let hex = color.toString().slice(1);
  if (colLen < 5) {
    hex = color.toString().replace(/./g, '$&$&');
  }
  const c = parseInt(hex, 16);
  const r = c >> 16;
  const g = (c >> 8) & 255;
  const b = c & 255;
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
  return hsp > 127.5 ? 'light' : 'dark';
};

export const images = [
  '/src/assets/public/intro-photo.png',
  '/src/assets/public/DSC03821.png',
  '/src/assets/public/git-photo.png',
  '/src/assets/public/about-photo.png',
  '/src/assets/public/socials-photo.png',
  '/src/assets/public/work-photo.png'
];
