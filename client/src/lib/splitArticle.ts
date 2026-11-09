/** Solo el título, sin texto debajo: un anuncio aquí quedaría separado de su contenido. */
const isHeading = (block: string) => /^#{1,6}\s[^\n]*$/.test(block.trim());
const isListItem = (block: string) => /^\s*([*-]|\d+\.)\s/.test(block);
const isH2 = (block: string) => /^##\s/.test(block.trimStart());

/** Corta un artículo Markdown en 3 partes sin dejar un anuncio pegado a un título o lista. */
export function splitArticle(markdown: string): [string, string, string] {
  const blocks = markdown.trim().split(/\n{2,}/);
  const offsets: number[] = [];
  let total = 0;
  for (const block of blocks) {
    offsets.push(total);
    total += block.length;
  }

  const safeCuts: number[] = [];
  const h2Cuts: number[] = [];
  for (let i = 1; i < blocks.length; i++) {
    const previous = blocks[i - 1];
    if (isH2(blocks[i])) h2Cuts.push(i);
    const splitsList = isListItem(previous) && isListItem(blocks[i]);
    if (!isHeading(previous) && !splitsList && !/:\s*$/.test(previous)) safeCuts.push(i);
  }

  const candidates = h2Cuts.length >= 2 ? h2Cuts : safeCuts;
  const closestTo = (target: number, exclude?: number) =>
    candidates
      .filter((cut) => cut !== exclude)
      .sort((a, b) => Math.abs(offsets[a] - target) - Math.abs(offsets[b] - target))[0];

  const first = closestTo(total / 3);
  const second = first === undefined ? undefined : closestTo((total * 2) / 3, first);
  const join = (from: number, to?: number) => blocks.slice(from, to).join("\n\n");

  if (first === undefined) return [join(0), "", ""];
  if (second === undefined) return [join(0, first), join(first), ""];

  const [a, b] = first < second ? [first, second] : [second, first];
  return [join(0, a), join(a, b), join(b)];
}
