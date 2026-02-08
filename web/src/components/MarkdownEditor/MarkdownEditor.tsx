import React, { useState } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Digite o contexto do cliente em Markdown...",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const renderMarkdown = (text: string): string => {
    if (!text) return "";

    let html = text;

    const lines = html.split("\n");
    const processedLines: string[] = [];
    let inList = false;
    let listItems: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.match(/^### (.*)$/)) {
        if (inList) {
          processedLines.push(`<ul class='list-disc list-inside mb-4'>${listItems.join("")}</ul>`);
          listItems = [];
          inList = false;
        }
        processedLines.push(`<h3 class='text-xl font-bold mb-2 mt-4'>${line.replace(/^### /, "")}</h3>`);
      } else if (line.match(/^## (.*)$/)) {
        if (inList) {
          processedLines.push(`<ul class='list-disc list-inside mb-4'>${listItems.join("")}</ul>`);
          listItems = [];
          inList = false;
        }
        processedLines.push(`<h2 class='text-2xl font-bold mb-3 mt-5'>${line.replace(/^## /, "")}</h2>`);
      } else if (line.match(/^# (.*)$/)) {
        if (inList) {
          processedLines.push(`<ul class='list-disc list-inside mb-4'>${listItems.join("")}</ul>`);
          listItems = [];
          inList = false;
        }
        processedLines.push(`<h1 class='text-3xl font-bold mb-4 mt-6'>${line.replace(/^# /, "")}</h1>`);
      } else if (line.match(/^[\-\+\*] (.*)$/)) {
        if (!inList) {
          inList = true;
        }
        const itemText = line.replace(/^[\-\+\*] /, "");
        listItems.push(`<li class='mb-1'>${processInlineMarkdown(itemText)}</li>`);
      } else {
        if (inList) {
          processedLines.push(`<ul class='list-disc list-inside mb-4'>${listItems.join("")}</ul>`);
          listItems = [];
          inList = false;
        }
        if (line) {
          processedLines.push(`<p class='mb-4'>${processInlineMarkdown(line)}</p>`);
        } else {
          processedLines.push("");
        }
      }
    }

    if (inList) {
      processedLines.push(`<ul class='list-disc list-inside mb-4'>${listItems.join("")}</ul>`);
    }

    return processedLines.join("\n");
  };

  const processInlineMarkdown = (text: string): string => {
    let html = text;

    html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");
    html = html.replace(/`(.*?)`/gim, "<code class='bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono'>$1</code>");
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, "<a href='$2' class='text-primary hover:underline' target='_blank' rel='noopener noreferrer'>$1</a>");

    return html;
  };

  return (
    <div className="w-full flex flex-col">
      <div className="border-b border-gray-200 dark:border-dark-border mb-4">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("edit")}
            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "edit"
                ? "border-primary dark:border-blue-400 text-primary dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-dark-text hover:border-gray-300 dark:hover:border-dark-border"
            }`}
          >
            Edição
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "preview"
                ? "border-primary dark:border-blue-400 text-primary dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-dark-text hover:border-gray-300 dark:hover:border-dark-border"
            }`}
          >
            Visualização
          </button>
        </nav>
      </div>

      {activeTab === "edit" && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[400px] px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-y"
        />
      )}

      {activeTab === "preview" && (
        <div
          className="w-full min-h-[400px] px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 overflow-auto"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) || "<p class='text-gray-400 dark:text-gray-500 italic'>Nenhum conteúdo para visualizar</p>" }}
        />
      )}
    </div>
  );
}

