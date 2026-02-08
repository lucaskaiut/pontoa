import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-markup';

interface DescriptionEditorProps {
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
  label: string;
}

export function DescriptionEditor({ value, onChange, error, label }: DescriptionEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const normalizedValue = (() => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  })();

  useEffect(() => {
    if (isHtmlMode) {
      setHtmlContent(normalizedValue);
    }
  }, [isHtmlMode, normalizedValue]);

  useEffect(() => {
    if (isHtmlMode && codeRef.current) {
      const highlight = () => {
        try {
          Prism.highlightElement(codeRef.current!);
        } catch (error) {
          console.warn('Error highlighting code:', error);
        }
      };
      
      requestAnimationFrame(() => {
        highlight();
      });
    }
  }, [htmlContent, isHtmlMode]);

  const handleSwitchToHtml = () => {
    setHtmlContent(normalizedValue);
    setIsHtmlMode(true);
  };

  const handleSwitchToVisual = () => {
    onChange(htmlContent);
    setIsHtmlMode(false);
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setHtmlContent(newValue);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  return (
    <div className="w-full user-description-editor">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-gray-700 font-semibold">
          {label}
        </label>
        <button
          type="button"
          onClick={isHtmlMode ? handleSwitchToVisual : handleSwitchToHtml}
          className="px-3 py-1 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
        >
          {isHtmlMode ? 'Modo Visual' : 'Editar HTML'}
        </button>
      </div>

      {!isHtmlMode ? (
        <div className="bg-white">
          <ReactQuill
            theme="snow"
            value={normalizedValue}
            onChange={(val) => onChange(val)}
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link'],
                ['clean']
              ],
            }}
          />
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
          <style>{`
            .html-editor-container {
              position: relative;
              min-height: 400px;
              max-height: 400px;
              overflow: hidden;
            }
            .html-editor-pre {
              margin: 0;
              padding: 12px;
              min-height: 400px;
              max-height: 400px;
              overflow: auto;
              background: #2d2d2d;
              color: #f8f8f2;
              position: relative;
              z-index: 0;
            }
            .html-editor-pre code {
              background: transparent !important;
            }
            .html-editor-textarea {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              padding: 12px;
              margin: 0;
              border: none;
              background: transparent;
              color: transparent;
              caret-color: #fff;
              resize: none;
              outline: none;
              font-size: 14px;
              line-height: 1.5;
              font-family: Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace;
              white-space: pre;
              overflow: auto;
              z-index: 1;
              min-height: 400px;
            }
            .html-editor-code {
              display: block;
              padding: 0;
              margin: 0;
              font-size: 14px;
              line-height: 1.5;
              font-family: Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace;
            }
          `}</style>
          <div className="html-editor-container">
            <pre ref={preRef} className="html-editor-pre">
              <code
                ref={codeRef}
                className="language-markup html-editor-code"
              >
                {htmlContent}
              </code>
            </pre>
            <textarea
              ref={textareaRef}
              value={htmlContent}
              onChange={handleHtmlChange}
              onScroll={handleScroll}
              className="html-editor-textarea"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {error && <span className="text-danger text-sm mt-1">{error}</span>}
    </div>
  );
}

