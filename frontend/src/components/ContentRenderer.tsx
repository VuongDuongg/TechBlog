import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css';
import {
  Copy,
  Check,
  Play,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface ContentRendererProps {
  content?: string;
  theme?: 'dark' | 'light';
  showVideoPlayer?: boolean;
}

// Regex nhận diện các biến thể link YouTube
const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi;

const extractYouTubeIds = (text: string): string[] => {
  if (!text) return [];
  const ids: string[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(YOUTUBE_REGEX.source, 'gi');
  while ((match = regex.exec(text)) !== null) {
    if (match[1] && !ids.includes(match[1])) {
      ids.push(match[1]);
    }
  }
  return ids;
};

// Component hiển thị từng khối Code Block có Syntax Highlighting và Nút Copy
interface CodeBlockProps {
  language?: string;
  codeString: string;
  isDark: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, codeString, isDark }) => {
  const [copied, setCopied] = useState(false);

  const cleanLang = (language || 'plaintext').toLowerCase();

  const highlightedHtml = useMemo(() => {
    const grammar = Prism.languages[cleanLang] || Prism.languages.javascript || Prism.languages.plaintext;
    try {
      return Prism.highlight(codeString, grammar, cleanLang);
    } catch {
      return codeString;
    }
  }, [codeString, cleanLang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Không thể copy code', err);
    }
  };

  return (
    <div className={`my-5 rounded-2xl overflow-hidden border shadow-lg transition-all ${
      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-700/80'
    }`}>
      {/* Code Header Bar: 3 nút macOS + Tên ngôn ngữ + Nút Copy */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs select-none">
        <div className="flex items-center gap-2">
          {/* Mac style dots */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono font-bold tracking-wider uppercase text-[11px] bg-slate-800 text-indigo-400 border border-slate-700/60">
            <Code2 className="w-3 h-3 text-indigo-400" />
            {cleanLang}
          </span>
        </div>

        {/* Nút Sao chép */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/70 transition-all text-xs font-medium cursor-pointer active:scale-95"
          title="Sao chép đoạn mã"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Đã chép!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Sao chép</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed bg-[#1d1f21]">
        <pre className="!m-0 !p-0 !bg-transparent">
          <code
            className={`language-${cleanLang} !bg-transparent font-mono`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  );
};

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  content = '',
  theme = 'light',
  showVideoPlayer = true,
}) => {
  const isDark = theme === 'dark';

  // 1. Tách danh sách video ID từ link YouTube có trong nội dung
  const youtubeVideoIds = useMemo(() => {
    return extractYouTubeIds(content);
  }, [content]);

  // 2. Nội dung markdown sau khi chuẩn hóa (loại bỏ link youtube đứng trần nếu đã render player)
  const processedContent = useMemo(() => {
    if (!content) return '';
    if (youtubeVideoIds.length === 0 || !showVideoPlayer) return content;

    // Loại bỏ dòng chỉ chứa link youtube để tránh trùng lặp với player ở trên
    return content
      .split('\n')
      .filter((line) => {
        const trimmed = line.trim();
        const isStandaloneYoutube =
          YOUTUBE_REGEX.test(trimmed) &&
          !trimmed.startsWith('[') &&
          trimmed.split(/\s+/).length === 1;
        return !isStandaloneYoutube;
      })
      .join('\n');
  }, [content, youtubeVideoIds, showVideoPlayer]);

  return (
    <div className={`w-full space-y-6 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      {/* KHUNG VIDEO YOUTUBE EMBED PLAYER (Nếu có video link trong nội dung) */}
      {showVideoPlayer && youtubeVideoIds.length > 0 && (
        <div className="space-y-4">
          {youtubeVideoIds.map((videoId, index) => (
            <div
              key={videoId}
              className={`rounded-2xl overflow-hidden border shadow-xl ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-white border-slate-200 shadow-slate-200/50'
              }`}
            >
              {/* Header của Video Player */}
              <div
                className={`flex items-center justify-between px-4 py-2.5 border-b text-xs ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-600 text-white shadow-sm">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </span>
                  <span>
                    Video bài giảng {youtubeVideoIds.length > 1 ? `#${index + 1}` : ''}
                  </span>
                </div>
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-500 font-medium transition-colors"
                >
                  <span>Mở trên YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Khung iframe 16:9 responsive */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`}
                  title={`YouTube video player - ${videoId}`}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KHUNG NỘI DUNG MARKDOWN & CODE HIGHLIGHTING */}
      {processedContent.trim() ? (
        <div
          className={`prose max-w-none text-sm sm:text-base leading-relaxed break-words ${
            isDark ? 'prose-invert text-slate-200' : 'text-slate-800'
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom Code block & Inline Code
              code({ className, children }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                const isInline = !match && !codeString.includes('\n');

                if (isInline) {
                  return (
                    <code
                      className={`px-1.5 py-0.5 rounded-md font-mono text-xs sm:text-sm font-semibold ${
                        isDark
                          ? 'bg-slate-800/90 text-indigo-300 border border-slate-700/60'
                          : 'bg-slate-100 text-indigo-600 border border-slate-200'
                      }`}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <CodeBlock
                    language={match ? match[1] : undefined}
                    codeString={codeString}
                    isDark={isDark}
                  />
                );
              },
              // Headings
              h1({ children }) {
                return (
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-6 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                    {children}
                  </h1>
                );
              },
              h2({ children }) {
                return (
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-6 mb-3">
                    {children}
                  </h2>
                );
              },
              h3({ children }) {
                return (
                  <h3 className="text-lg sm:text-xl font-bold mt-5 mb-2 text-indigo-500 dark:text-indigo-400">
                    {children}
                  </h3>
                );
              },
              // Paragraphs
              p({ children }) {
                return <p className="mb-4 leading-7 text-justify sm:text-left">{children}</p>;
              },
              // Blockquote
              blockquote({ children }) {
                return (
                  <blockquote
                    className={`my-4 pl-4 py-1 border-l-4 italic rounded-r-xl ${
                      isDark
                        ? 'border-indigo-500 bg-slate-900/60 text-slate-300'
                        : 'border-indigo-600 bg-indigo-50/50 text-slate-700'
                    }`}
                  >
                    {children}
                  </blockquote>
                );
              },
              // Lists
              ul({ children }) {
                return <ul className="my-3 pl-6 list-disc space-y-1.5">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="my-3 pl-6 list-decimal space-y-1.5">{children}</ol>;
              },
              li({ children }) {
                return <li className="leading-relaxed">{children}</li>;
              },
              // Tables (GFM)
              table({ children }) {
                return (
                  <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-sm divide-y divide-slate-200 dark:divide-slate-800">
                      {children}
                    </table>
                  </div>
                );
              },
              thead({ children }) {
                return (
                  <thead className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-100 text-slate-800'}>
                    {children}
                  </thead>
                );
              },
              th({ children }) {
                return <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">{children}</th>;
              },
              td({ children }) {
                return (
                  <td className={`px-4 py-3 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
                    {children}
                  </td>
                );
              },
              // Links
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-indigo-500 hover:text-indigo-400 underline underline-offset-2 transition-colors inline-flex items-center gap-0.5"
                  >
                    <span>{children}</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                );
              },
              // Horizontal Rule
              hr() {
                return <hr className={`my-8 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />;
              },
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </div>
      ) : (
        <div className={`py-8 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Nội dung đang được biên soạn chi tiết.
        </div>
      )}
    </div>
  );
};
