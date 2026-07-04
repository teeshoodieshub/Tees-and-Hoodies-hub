export const colorNames: Record<string, string> = {
  "#111": "Black",
  "#fff": "White",
  "#1F2A44": "Navy Blue",
  "#8B8B8B": "Ash",
  "#722F37": "Wine",
  "#800020": "Maroon",
  "#4B5320": "Army Green",
  "#228B22": "Forest Green",
  "#F5F5DC": "Cream",
  "#FF5F7D": "Pink",
  "#FFB6C1": "Pink",
  "#C19A5B": "Camel",
  "#FFD400": "Yellow",
  "#6D3FD1": "Purple",
};

export function getColorLabel(color: string) {
  return colorNames[color] || color;
}
