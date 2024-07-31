export interface category {
  text: string;
  hoverText: string;
  linksTo: string;
}

export type categories = categoty[];

type Hex = string;
type Rgb = [r: number, g: number, b: number];
type Output = Hex | Rgb | (Hex | Rgb)[] | string;
