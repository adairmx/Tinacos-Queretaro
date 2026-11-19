/** Solo el título, sin texto debajo: un anuncio aquí quedaría separado de su contenido. */
const isHeading = (block: string) => /^#{1,6}\s[^\n]*$/.test(block.trim());
const isListItem = (block: string) => /^\s*([*-]|\d+\.)\s/.test(block);
const isH2 = (block: string) => /^##\s/.test(block.trimStart());
const isImage = (block: string) => /^!\[/.test(block.trim());
const isTable = (block: string) => /^\|/.test(block.trim());
/** Arranque de un punto de lista sin sangría (los que llevan sangría son sublistas o continuación). */
const LIST_ITEM_START = /^([*-]|\d+\.)\s/;

export interface SplitOptions {
  /** Cuántos caracteres caben en un renglón del artículo con el ancho de esta pantalla. */
  charsPerLine: number;
  /** Cuántos renglones de texto van entre un anuncio y el siguiente (≈ una pantalla). */
  linesPerPart: number;
  /** Renglones que ya ocupa lo que va antes del texto (portada, índice): adelantan el primer anuncio. */
  startLines?: number;
}

/**
 * Cuántos renglones ocupa un bloque en pantalla, contando los márgenes que le pone `BlogPost`
 * (párrafo: 24 px abajo; h2: 48 px arriba y letra grande; renglón: 32 px).
 */
function blockLines(block: string, charsPerLine: number): number {
  const text = block.trim();
  if (isImage(text)) return 10;
  // En una pantalla angosta las celdas se parten en dos o tres renglones.
  if (isTable(text)) return text.split("\n").length * (charsPerLine < 60 ? 2.5 : 1.5) + 1;
  if (isHeading(text)) return Math.ceil(text.length / (charsPerLine * 0.65)) * 1.3 + (isH2(text) ? 2.5 : 1.5);
  if (isListItem(text)) {
    const items = text.split("\n").filter((line) => isListItem(line));
    const textLines = text.split("\n").reduce((n, line) => n + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);
    return textLines + items.length * 0.25 + 0.75;
  }
  return Math.max(1, Math.ceil(text.length / charsPerLine)) + 0.75;
}

interface Unit {
  text: string;
  /** Lo que lo une con el anterior: línea en blanco entre bloques, un solo salto entre puntos de una lista. */
  sep: string;
  lines: number;
  /** Punto de una lista larga: su lugar en la lista y cuántos puntos tiene. */
  item?: { index: number; count: number };
}

/** Separa los bloques; las listas que ocupan más de media pantalla se separan además punto por punto. */
function toUnits(blocks: string[], charsPerLine: number, linesPerPart: number): Unit[] {
  const units: Unit[] = [];
  for (const block of blocks) {
    const lines = blockLines(block, charsPerLine);
    if (!isListItem(block) || lines < linesPerPart * 0.6) {
      units.push({ text: block, sep: "\n\n", lines });
      continue;
    }
    // Cada punto se queda con sus renglones de continuación y sus sublistas.
    const items: string[] = [];
    for (const line of block.split("\n")) {
      if (LIST_ITEM_START.test(line) || items.length === 0) items.push(line);
      else items[items.length - 1] += `\n${line}`;
    }
    items.forEach((item, i) =>
      units.push({
        text: item,
        sep: i === 0 ? "\n\n" : "\n",
        lines: blockLines(item, charsPerLine) - 0.5,
        item: { index: i, count: items.length },
      }),
    );
  }
  return units;
}

/**
 * Corta un artículo Markdown en partes de más o menos una pantalla para meter un anuncio entre cada una.
 * Nunca corta pegado a un título, después de un «:» que presenta algo ni entre dos listas seguidas; dentro
 * de una lista sólo corta si es larga (más de media pantalla) y deja dos puntos de cada lado; la numeración
 * sigue («4.» arranca en 4).
 * Si se acerca un h2, prefiere cortar justo antes de él (el anuncio queda entre dos secciones).
 */
export function splitArticle(markdown: string, { charsPerLine, linesPerPart, startLines = 0 }: SplitOptions): string[] {
  const blocks = markdown.trim().split(/\n{2,}/).filter((block) => block.trim());
  if (blocks.length === 0) return [];
  const units = toUnits(blocks, charsPerLine, linesPerPart);

  const parts: string[] = [];
  let current = "";
  let lines = startLines;

  units.forEach((unit, i) => {
    const previous = units[i - 1];
    // Dentro de una lista: al menos dos puntos antes del anuncio y dos después.
    const insideList = unit.sep === "\n";
    const listCutOk = !!unit.item && unit.item.index >= 2 && unit.item.count - unit.item.index >= 2;
    const safe =
      current !== "" &&
      !isHeading(previous.text) &&
      !/:\s*$/.test(previous.text) &&
      (insideList ? listCutOk : !(isListItem(previous.text) && isListItem(unit.text)));
    const wantsCut = lines >= linesPerPart || (isH2(unit.text) && lines >= linesPerPart * 0.7);

    if (safe && wantsCut) {
      parts.push(current);
      current = "";
      lines = 0;
    }
    current = current === "" ? unit.text : current + unit.sep + unit.text;
    lines += unit.lines;
  });

  // Un pedacito suelto al final no justifica otro anuncio: se une al anterior.
  if (parts.length > 0 && lines < linesPerPart * 0.35) {
    parts[parts.length - 1] += `\n\n${current}`;
  } else {
    parts.push(current);
  }
  return parts;
}
