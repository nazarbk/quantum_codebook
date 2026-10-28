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
  const lines = text.split('\n');
  if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
    return <ul key={index} className="my-3 list-disc space-y-1 pl-5 text-slate-300">{lines.map((line, lineIndex) => <li key={lineIndex}>{renderInline(line.replace(/^\s*[-*]\s+/, ''), `list-${index}-${lineIndex}`)}</li>)}</ul>;
  }
  return <p key={index} className="my-2 leading-7 text-slate-300">{renderInline(text.replace(/\n/g, ' '), `paragraph-${index}`)}</p>;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => (
  <div className={`math-content max-w-none ${className}`}>
    {content.trim().split(/\n\s*\n/).filter(Boolean).map(renderBlock)}
  </div>
);
