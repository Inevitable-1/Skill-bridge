import { useState, useRef, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play, Copy, Check, Sun, Moon, Minus, Plus, ChevronDown, ChevronUp,
  Terminal, Trash2, Code2, Loader2, Download, RotateCcw, Users,
} from 'lucide-react';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', monacoId: 'javascript' },
  { id: 'typescript', label: 'TypeScript', monacoId: 'typescript' },
  { id: 'python', label: 'Python', monacoId: 'python' },
  { id: 'java', label: 'Java', monacoId: 'java' },
  { id: 'c', label: 'C', monacoId: 'c' },
  { id: 'cpp', label: 'C++', monacoId: 'cpp' },
  { id: 'go', label: 'Go', monacoId: 'go' },
  { id: 'rust', label: 'Rust', monacoId: 'rust' },
  { id: 'php', label: 'PHP', monacoId: 'php' },
  { id: 'ruby', label: 'Ruby', monacoId: 'ruby' },
  { id: 'swift', label: 'Swift', monacoId: 'swift' },
  { id: 'kotlin', label: 'Kotlin', monacoId: 'kotlin' },
  { id: 'json', label: 'JSON', monacoId: 'json' },
  { id: 'html', label: 'HTML', monacoId: 'html' },
  { id: 'css', label: 'CSS', monacoId: 'css' },
  { id: 'sql', label: 'SQL', monacoId: 'sql' },
  { id: 'markdown', label: 'Markdown', monacoId: 'markdown' },
];

const TAB_SIZES = [2, 4];

const DEFAULT_CODE = {
  javascript: `// JavaScript
function greet(name) {
  console.log("Hello, " + name + "!");
  return name;
}
greet("World");`,
  typescript: `// TypeScript
function greet(name: string): string {
  console.log(\`Hello, \${name}!\`);
  return name;
}
greet("World");`,
  python: `# Python
def greet(name):
    print(f"Hello, {name}!")
    return name
greet("World")`,
  java: `// Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  c: `// C
#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  cpp: `// C++
#include <iostream>
int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  go: `// Go
package main
import "fmt"
func main() {
    fmt.Println("Hello, World!")
}`,
  rust: `// Rust
fn main() {
    println!("Hello, World!");
}`,
  php: `<?php
// PHP
echo "Hello, World!\\n";`,
  ruby: `# Ruby
puts "Hello, World!"`,
  swift: `// Swift
import Foundation
print("Hello, World!")`,
  kotlin: `// Kotlin
fun main() {
    println("Hello, World!")
}`,
  json: `{
  "name": "world",
  "greeting": "Hello"
}`,
  html: `<!DOCTYPE html>
<html>
<head><title>Greeting</title></head>
<body><h1>Hello, World!</h1></body>
</html>`,
  css: `/* CSS */
.greeting {
  color: #6366f1;
  font-size: 1.5rem;
}`,
  sql: `-- SQL
SELECT 'Hello, World!' AS greeting;`,
  markdown: `# Hello, World!
This is a **markdown** document.`,
};

function extractMockOutput(code, language) {
  const lines = [];
  const langId = language?.id || 'javascript';
  let stringPattern;

  if (langId === 'javascript' || langId === 'typescript') {
    stringPattern = /console\.log\(([^)]+)\)/g;
  } else if (langId === 'python') {
    stringPattern = /print\(([^)]+)\)/g;
  } else if (langId === 'java') {
    stringPattern = /System\.out\.println\(([^)]+)\)/g;
  } else if (langId === 'c' || langId === 'cpp') {
    stringPattern = /printf\("([^"]+)"\)/g;
  } else if (langId === 'go') {
    stringPattern = /fmt\.Print(ln|f)?\(([^)]+)\)/g;
  } else if (langId === 'rust') {
    stringPattern = /println!\("([^"]+)"\)/g;
  } else if (langId === 'php') {
    stringPattern = /echo\s+["']([^"']+)["']/g;
  } else if (langId === 'ruby') {
    stringPattern = /puts\s+["']([^"']+)["']/g;
  } else if (langId === 'swift' || langId === 'kotlin') {
    stringPattern = /print\(([^)]+)\)/g;
  } else {
    return lines;
  }

  let match;
  while ((match = stringPattern.exec(code)) !== null) {
    let content = match[1]?.trim() || match[2]?.trim() || '';
    content = content.replace(/["'`]/g, '').replace(/\\n/g, '');
    if (content) lines.push(content);
  }
  return lines;
}

export default function CodeEditor({ roomId, socket, onCodeChange, language, compact }) {
  const currentLanguage = language || LANGUAGES[0];
  const [selectedLanguage, setSelectedLanguage] = useState(
    LANGUAGES.find((l) => l.id === currentLanguage?.id) || LANGUAGES[0]
  );
  const [code, setCode] = useState(DEFAULT_CODE[selectedLanguage.id] || DEFAULT_CODE.javascript);
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(4);
  const [isOutputOpen, setIsOutputOpen] = useState(!compact);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showTabDropdown, setShowTabDropdown] = useState(false);

  const editorRef = useRef(null);
  const langDropdownRef = useRef(null);
  const tabDropdownRef = useRef(null);

  const handleEditorDidMount = (editor) => { editorRef.current = editor; };

  const handleCodeChange = useCallback((value) => {
    setCode(value || '');
    onCodeChange?.(value, selectedLanguage);
  }, [onCodeChange, selectedLanguage]);

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    setCode(DEFAULT_CODE[lang.id] || '');
    setShowLangDropdown(false);
    onCodeChange?.(DEFAULT_CODE[lang.id] || '', lang);
  };

  const handleTabSizeChange = (size) => {
    setTabSize(size);
    setShowTabDropdown(false);
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) model.updateOptions({ tabSize: size });
    }
  };

  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 1, 32));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 1, 8));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = useCallback(() => {
    const ext = { javascript: 'js', typescript: 'ts', python: 'py', java: 'java', c: 'c', cpp: 'cpp', go: 'go', rust: 'rs', php: 'php', ruby: 'rb', swift: 'swift', kt: 'kt', json: 'json', html: 'html', css: 'css', sql: 'sql', markdown: 'md' };
    const extMap = { kotlin: 'kt' };
    const fileExt = extMap[selectedLanguage.id] || ext[selectedLanguage.id] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `code.${fileExt}`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [code, selectedLanguage]);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setOutput([]);
    setTimeout(() => {
      const extracted = extractMockOutput(code, selectedLanguage);
      if (extracted.length === 0) {
        setOutput([
          { type: 'info', text: 'Program executed successfully (no output).' },
          { type: 'success', text: 'Process exited with code 0' },
        ]);
      } else {
        const outputLines = extracted.map((line) => ({ type: 'log', text: line }));
        outputLines.push({ type: 'success', text: 'Process exited with code 0' });
        setOutput(outputLines);
      }
      setIsRunning(false);
      setIsOutputOpen(true);
    }, 800 + Math.random() * 400);
  }, [code, selectedLanguage]);

  const clearOutput = () => setOutput([]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) setShowLangDropdown(false);
      if (tabDropdownRef.current && !tabDropdownRef.current.contains(e.target)) setShowTabDropdown(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (compact) {
    return (
      <div className="flex flex-col h-full bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="relative" ref={langDropdownRef}>
              <button onClick={() => setShowLangDropdown(!showLangDropdown)} className="flex items-center gap-1.5 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-200 transition-colors">
                <Code2 className="w-3 h-3 text-emerald-400" />
                <span>{selectedLanguage.label}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showLangDropdown && (
                <div className="absolute top-full left-0 mt-1 w-36 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
                  {LANGUAGES.map((lang) => (
                    <button key={lang.id} onClick={() => handleLanguageChange(lang)} className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${selectedLanguage.id === lang.id ? 'bg-emerald-600 text-white' : 'text-gray-200 hover:bg-gray-600'}`}>
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleCopy} className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 transition-colors" title="Copy">
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </button>
            <button onClick={handleDownload} className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 transition-colors" title="Download">
              <Download className="w-3 h-3" />
            </button>
            <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-500 disabled:bg-green-800 rounded text-xs font-medium text-white transition-colors">
              {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              <span>Run</span>
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <Editor height="100%" language={selectedLanguage.monacoId} theme={theme} value={code} onChange={handleCodeChange} onMount={handleEditorDidMount}
            options={{ fontSize: 12, tabSize, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', automaticLayout: true, padding: { top: 8, bottom: 8 }, lineNumbers: 'on', renderLineHighlight: 'all', fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace", fontLigatures: true }}
            loading={<div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="relative" ref={langDropdownRef}>
            <button onClick={() => { setShowLangDropdown(!showLangDropdown); setShowTabDropdown(false); }} className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-200 transition-colors">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>{selectedLanguage.label}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showLangDropdown && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-50 py-1 max-h-72 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <button key={lang.id} onClick={() => handleLanguageChange(lang)} className={`w-full text-left px-3 py-2 text-sm transition-colors ${selectedLanguage.id === lang.id ? 'bg-emerald-600 text-white' : 'text-gray-200 hover:bg-gray-600'}`}>
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={tabDropdownRef}>
            <button onClick={() => { setShowTabDropdown(!showTabDropdown); setShowLangDropdown(false); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-200 transition-colors">
              <span>Tab: {tabSize}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showTabDropdown && (
              <div className="absolute top-full left-0 mt-1 w-24 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-50 py-1">
                {TAB_SIZES.map((size) => (
                  <button key={size} onClick={() => handleTabSizeChange(size)} className={`w-full text-left px-3 py-2 text-sm transition-colors ${tabSize === size ? 'bg-emerald-600 text-white' : 'text-gray-200 hover:bg-gray-600'}`}>
                    {size} spaces
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-200 transition-colors">
            {copied ? <><Check className="w-4 h-4 text-green-400" /><span className="text-green-400">Copied</span></> : <><Copy className="w-4 h-4" /><span>Copy</span></>}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-200 transition-colors" title="Download">
            <Download className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={decreaseFontSize} className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
            <span className="text-xs text-gray-400 w-8 text-center font-mono">{fontSize}</span>
            <button onClick={increaseFontSize} className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <div className="w-px h-5 bg-gray-600" />
          <button onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition-colors">
            {theme === 'vs-dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="w-px h-5 bg-gray-600" />
          <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors">
            {isRunning ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Running</span></> : <><Play className="w-4 h-4" /><span>Run</span></>}
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Editor height="100%" language={selectedLanguage.monacoId} theme={theme} value={code} onChange={handleCodeChange} onMount={handleEditorDidMount}
          options={{ fontSize, tabSize, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', automaticLayout: true, padding: { top: 12, bottom: 12 }, lineNumbers: 'on', renderLineHighlight: 'all', smoothScrolling: true, cursorBlinking: 'smooth', cursorSmoothCaretAnimation: 'on', bracketPairColorization: { enabled: true }, fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', Consolas, monospace", fontLigatures: true }}
          loading={<div className="flex items-center justify-center h-full bg-gray-900"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>}
        />
      </div>
      <div className={`border-t border-gray-700 transition-all duration-300 ${isOutputOpen ? 'h-48' : 'h-10'}`}>
        <button onClick={() => setIsOutputOpen(!isOutputOpen)} className="w-full flex items-center justify-between px-4 py-2 bg-gray-800 hover:bg-gray-750 transition-colors">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Output</span>
            {output.length > 0 && <span className="text-xs px-1.5 py-0.5 bg-gray-600 rounded text-gray-300">{output.length}</span>}
          </div>
          <div className="flex items-center gap-2">
            {output.length > 0 && (
              <span onClick={(e) => { e.stopPropagation(); clearOutput(); }} className="p-1 hover:bg-gray-600 rounded transition-colors text-gray-400 hover:text-gray-200" title="Clear output">
                <Trash2 className="w-3.5 h-3.5" />
              </span>
            )}
            {isOutputOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
          </div>
        </button>
        {isOutputOpen && (
          <div className="h-[calc(100%-2.5rem)] overflow-y-auto bg-gray-900 p-4 font-mono text-sm">
            {output.length === 0 ? (
              <p className="text-gray-500 italic">Click &quot;Run&quot; to execute your code...</p>
            ) : (
              <div className="space-y-1">
                {output.map((line, idx) => (
                  <div key={idx} className={`${line.type === 'success' ? 'text-green-400' : line.type === 'error' ? 'text-red-400' : line.type === 'info' ? 'text-blue-400' : 'text-gray-200'}`}>
                    {line.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
