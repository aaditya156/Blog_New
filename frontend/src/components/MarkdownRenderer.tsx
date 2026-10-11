"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

/**
 * CodeBlock component with copy functionality, language pill, and sleek styling.
 */
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-md">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/90 border-b border-slate-700/80 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="uppercase font-semibold tracking-wider text-slate-300">
            {language || "code"}
          </span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 transition"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-slate-100">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

/**
 * Renders inline markdown text (bold, italic, inline code, links).
 */
function renderInline(text: string): React.ReactNode {
  // Regex to match bold, italic, code, link
  // Matches: `code`, **bold**, *italic*, [text](url)
  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // 1. Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      tokens.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 mx-0.5 rounded-md text-xs sm:text-sm font-mono font-medium bg-slate-100 text-indigo-700 border border-slate-200/90"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // 2. Bold: **text** or __text__
    const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
    if (boldMatch) {
      tokens.push(
        <strong key={key++} className="font-bold text-slate-900">
          {renderInline(boldMatch[2])}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // 3. Italic: *text* or _text_
    const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
    if (italicMatch) {
      tokens.push(
        <em key={key++} className="italic text-slate-800">
          {renderInline(italicMatch[2])}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // 4. Link: [text](url)
    const linkMatch = remaining.match(/^\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      tokens.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target={linkMatch[2].startsWith("http") ? "_blank" : undefined}
          rel={linkMatch[2].startsWith("http") ? "noopener noreferrer" : undefined}
          className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2 transition"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Find the next potential special marker
    const nextSpecialIndex = remaining.search(/[`*_\[]/);
    if (nextSpecialIndex === -1) {
      tokens.push(remaining);
      break;
    } else if (nextSpecialIndex > 0) {
      tokens.push(remaining.slice(0, nextSpecialIndex));
      remaining = remaining.slice(nextSpecialIndex);
    } else {
      // If none of our patterns matched at index 0, consume single character to prevent infinite loop
      tokens.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

/**
 * Rich, soothing Markdown Renderer tailored for technical blog articles.
 */
export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split into lines and parse blocks
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let index = 0;
  let elementKey = 0;

  while (index < lines.length) {
    const line = lines[index];

    // Check for code block opening: ```lang
    if (line.trim().startsWith("```")) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      index++;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index++;
      }
      index++; // skip closing ```

      elements.push(
        <CodeBlock
          key={elementKey++}
          code={codeLines.join("\n")}
          language={language || "typescript"}
        />
      );
      continue;
    }

    // Check for blockquote: > text
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s*/, ""));
        index++;
      }

      elements.push(
        <blockquote
          key={elementKey++}
          className="my-6 pl-4 py-2 border-l-4 border-indigo-500 bg-indigo-50/60 rounded-r-xl text-slate-700 italic text-base sm:text-lg leading-relaxed shadow-xs"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx}>{renderInline(ql)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Check for unordered lists: - or *
    if (/^(\s*[-*]\s+)/.test(line)) {
      const listItems: string[] = [];
      while (index < lines.length && /^(\s*[-*]\s+)/.test(lines[index])) {
        listItems.push(lines[index].replace(/^(\s*[-*]\s+)/, ""));
        index++;
      }

      elements.push(
        <ul key={elementKey++} className="my-5 space-y-2.5 pl-2">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start gap-2.5 text-slate-700 leading-relaxed text-base sm:text-lg">
              <span className="w-2 h-2 rounded-full bg-indigo-600 mt-2.5 shrink-0" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Check for ordered lists: 1. 2.
    if (/^\s*\d+\.\s+/.test(line)) {
      const listItems: string[] = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        listItems.push(lines[index].replace(/^\s*\d+\.\s+/, ""));
        index++;
      }

      elements.push(
        <ol key={elementKey++} className="my-5 space-y-2.5 list-decimal pl-6 text-slate-700 leading-relaxed text-base sm:text-lg">
          {listItems.map((item, lIdx) => (
            <li key={lIdx}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={elementKey++}
          className="text-2xl sm:text-3xl font-bold text-slate-900 mt-8 mb-4 tracking-tight"
        >
          {renderInline(line.slice(2))}
        </h1>
      );
      index++;
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={elementKey++}
          className="text-xl sm:text-2xl font-bold text-slate-900 mt-8 mb-3 tracking-tight pb-2 border-b border-slate-200"
        >
          {renderInline(line.slice(3))}
        </h2>
      );
      index++;
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={elementKey++}
          className="text-lg sm:text-xl font-semibold text-slate-900 mt-6 mb-2 tracking-tight"
        >
          {renderInline(line.slice(4))}
        </h3>
      );
      index++;
      continue;
    }

    // Horizontal Rule: ---
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(line.trim())) {
      elements.push(
        <hr key={elementKey++} className="my-8 border-t border-slate-200" />
      );
      index++;
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      index++;
      continue;
    }

    // Regular Paragraphs
    elements.push(
      <p
        key={elementKey++}
        className="text-slate-700 text-base sm:text-lg leading-relaxed mb-4 font-normal"
      >
        {renderInline(line)}
      </p>
    );
    index++;
  }

  return <div className="space-y-2">{elements}</div>;
}
