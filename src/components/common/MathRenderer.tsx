import React from 'react';

interface MathRendererProps { content: string; className?: string }

declare global {
  interface Window {
    katex?: { renderToString: (source: string, options: { displayMode: boolean; throwOnError: boolean; trust: boolean }) => string };
  }
}

const inlineToken = /(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  return text.split(inlineToken).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith('$$') && part.endsWith('$$')) return renderMath(part.slice(2, -2), true, key);
    if (part.startsWith('$') && part.endsWith('$')) return renderMath(part.slice(1, -1), false, key);
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={key} className="font-semibold text-slate-100">{renderInline(part.slice(2, -2), `${key}-strong`)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={key} className="rounded bg-slate-950/80 px-1.5 py-0.5 font-mono text-teal-300">{part.slice(1, -1)}</code>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={key}>{renderInline(part.slice(1, -1), `${key}-em`)}</em>;
    return part;
  });
}

function renderMath(source: string, displayMode: boolean, key: string): React.ReactNode {
  const html = window.katex?.renderToString(source.trim(), { displayMode, throwOnError: false, trust: false });
  if (!html) return <span key={key} className={displayMode ? 'math-fallback math-display' : 'math-fallback'}>{source}</span>;
  return <span key={key} className={displayMode ? 'math-display' : 'math-inline'} dangerouslySetInnerHTML={{ __html: html }} />;
}

function renderBlock(block: string, index: number): React.ReactNode {
  const text = block.trim();
  const heading = text.match(/^(#{1,4})\s+(.+)$/);
  if (heading) return <h3 key={index} className="mb-2 mt-4 text-sm font-bold text-cyan-200">{renderInline(heading[2], `heading-${index}`)}</h3>;
  if (text.startsWith('$$') && text.endsWith('$$')) return <div key={index} className="formula-card">{renderMath(text.slice(2, -2), true, `display-${index}`)}</div>;
  // A block may mix a lead-in sentence with a list: group consecutive lines by kind.
  const kindOf = (line: string) => (/^\s*[-*]\s+/.test(line) ? 'ul' : /^\s*\d+[.)]\s+/.test(line) ? 'ol' : 'p');
  const groups: { kind: 'ul' | 'ol' | 'p'; lines: string[] }[] = [];
  for (const line of text.split('\n')) {
    const kind = kindOf(line);
    const last = groups[groups.length - 1];
    if (last && last.kind === kind) last.lines.push(line);
    else groups.push({ kind, lines: [line] });
  }
  const rendered = groups.map((group, groupIndex) => {
    const key = `${index}-${groupIndex}`;
    if (group.kind === 'p') return <p key={key} className="my-2 leading-7 text-slate-300">{renderInline(group.lines.join(' '), `paragraph-${key}`)}</p>;
    const items = group.lines.map((line, lineIndex) => <li key={lineIndex}>{renderInline(line.replace(/^\s*(?:[-*]|\d+[.)])\s+/, ''), `list-${key}-${lineIndex}`)}</li>);
    return group.kind === 'ul'
      ? <ul key={key} className="my-3 list-disc space-y-1 pl-5 text-slate-300">{items}</ul>
      : <ol key={key} className="my-3 list-decimal space-y-1 pl-5 text-slate-300">{items}</ol>;
  });
  return rendered.length === 1 ? rendered[0] : <React.Fragment key={index}>{rendered}</React.Fragment>;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => (
  <div className={`math-content max-w-none ${className}`}>
    {content.trim().split(/\n\s*\n/).filter(Boolean).map(renderBlock)}
  </div>
);
