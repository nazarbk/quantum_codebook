/**
 * Switches the editor's code to another language without losing the learner's work.
 *
 * Starter code exists in ES and EN with the same lines in the same order. Every line of the
 * current code that is still identical to a line of the old-language starter (comments, print
 * texts…) is swapped for its counterpart; lines the learner wrote or edited are left alone.
 * Unedited code therefore becomes exactly the starter code of the new language.
 */
export function translateStarterCode(code: string, fromStarter: string, toStarter: string): string {
  if (code === fromStarter) return toStarter;
  const fromLines = fromStarter.split('\n');
  const toLines = toStarter.split('\n');
  if (fromLines.length !== toLines.length) return code; // versions out of sync: never risk the user's code

  const translations = new Map<string, string>();
  fromLines.forEach((line, index) => {
    if (line !== toLines[index] && !translations.has(line)) translations.set(line, toLines[index]);
  });

  const eol = code.includes('\r\n') ? '\r\n' : '\n';
  return code
    .split(/\r?\n/)
    .map((line) => translations.get(line) ?? line)
    .join(eol);
}
