import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

export function createMarkdownComponents(): Components {
  return {
    code({ className, children, ...props }) {
      const matchedLanguage = /language-(\w+)/.exec(className || '');
      const language = matchedLanguage?.[1];

      // 如果有语言标记，使用语法高亮
      if (language) {
        return (
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={language}
            PreTag="div"
            showLineNumbers
            customStyle={{
              margin: '1rem 0',
              borderRadius: '0.5rem',
              padding: '1rem',
              fontSize: '0.875rem'
            }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }

      // 行内代码
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };
}
