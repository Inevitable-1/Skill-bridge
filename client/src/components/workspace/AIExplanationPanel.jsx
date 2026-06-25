import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Brain, Zap, AlertTriangle, CheckCircle, Clock,
  Clipboard, ClipboardCheck, ChevronDown, ChevronUp,
  Lightbulb, BookOpen, RefreshCw, FileCode, Sparkles
} from 'lucide-react';

const PATTERNS = {
  functionDeclaration: {
    regex: /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)/,
    explain: (match) => `Defines a function named \`${match[1]}\``,
    icon: 'function',
  },
  arrowFunction: {
    regex: /^\s*(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=])\s*=>/,
    explain: (match) => `Defines an arrow function assigned to \`${match[1]}\``,
    icon: 'function',
  },
  classDeclaration: {
    regex: /^\s*(?:export\s+)?(?:default\s+)?class\s+(\w+)/,
    explain: (match) => `Defines a class named \`${match[1]}\``,
    icon: 'class',
  },
  importStatement: {
    regex: /^\s*import\s+.*?\s+from\s+['"](.+?)['"]/,
    explain: (match) => `Imports module from \`${match[1]}\``,
    icon: 'import',
  },
  exportDefault: {
    regex: /^\s*export\s+default\s+/,
    explain: () => `Exports a default value from this module`,
    icon: 'export',
  },
  exportNamed: {
    regex: /^\s*export\s+(?:const|let|var|function|class)\s+(\w+)/,
    explain: (match) => `Exports named member \`${match[1]}\``,
    icon: 'export',
  },
  returnStatement: {
    regex: /^\s*return\s+(.*)/,
    explain: (match) => {
      const val = match[1].trim();
      if (!val) return 'Returns from the function (no value)';
      if (val.length > 50) return `Returns a complex expression`;
      return `Returns \`${val}\``;
    },
    icon: 'return',
  },
  forLoop: {
    regex: /^\s*for\s*\(/,
    explain: () => `Starts a for loop — iterates over a sequence`,
    icon: 'loop',
  },
  whileLoop: {
    regex: /^\s*while\s*\(/,
    explain: () => `Starts a while loop — repeats while condition is true`,
    icon: 'loop',
  },
  forEachLoop: {
    regex: /\.forEach\s*\(/,
    explain: () => `Iterates over array elements using \`forEach\``,
    icon: 'loop',
  },
  mapLoop: {
    regex: /\.map\s*\(/,
    explain: () => `Transforms each array element using \`map\` and returns a new array`,
    icon: 'loop',
  },
  filterLoop: {
    regex: /\.filter\s*\(/,
    explain: () => `Filters array elements using a predicate function`,
    icon: 'loop',
  },
  ifStatement: {
    regex: /^\s*if\s*\(/,
    explain: () => `Conditional check — executes block if condition is truthy`,
    icon: 'condition',
  },
  elseIfStatement: {
    regex: /^\s*else\s+if\s*\(/,
    explain: () => `Alternative condition — checked if previous conditions were falsy`,
    icon: 'condition',
  },
  elseStatement: {
    regex: /^\s*else\s*\{?/,
    explain: () => `Fallback block — executes when all conditions are falsy`,
    icon: 'condition',
  },
  switchStatement: {
    regex: /^\s*switch\s*\(/,
    explain: () => `Switch statement — matches expression against multiple cases`,
    icon: 'condition',
  },
  caseStatement: {
    regex: /^\s*case\s+/,
    explain: (match) => `Case branch — matches against ${match[0].trim()}`,
    icon: 'condition',
  },
  tryCatch: {
    regex: /^\s*try\s*\{?/,
    explain: () => `Try block — wraps code that may throw an error`,
    icon: 'error',
  },
  catchBlock: {
    regex: /^\s*catch\s*\(/,
    explain: () => `Catch block — handles errors thrown in the try block`,
    icon: 'error',
  },
  throwStatement: {
    regex: /^\s*throw\s+/,
    explain: () => `Throws an error — interrupts normal execution flow`,
    icon: 'error',
  },
  consoleLog: {
    regex: /console\.(log|warn|error|info|debug)\s*\(/,
    explain: (match) => `Logs ${match[1] === 'log' ? 'output' : match[1]} to the console`,
    icon: 'output',
  },
  variableDeclaration: {
    regex: /^\s*(const|let|var)\s+(\w+)\s*=\s*(.*)/,
    explain: (match) => {
      const keyword = match[1];
      const name = match[2];
      const value = match[3].trim();
      if (value.length > 60) return `Declares ${keyword} \`${name}\` with a complex expression`;
      if (!value) return `Declares ${keyword} \`${name}\` (uninitialized)`;
      return `Declares ${keyword} \`${name}\` initialized to \`${value}\``;
    },
    icon: 'variable',
  },
  destructuring: {
    regex: /^\s*(?:const|let|var)\s*\{/,
    explain: () => `Destructures an object into individual variables`,
    icon: 'variable',
  },
  arrayDestructuring: {
    regex: /^\s*(?:const|let|var)\s*\[/,
    explain: () => `Destructures an array into individual variables`,
    icon: 'variable',
  },
  awaitExpression: {
    regex: /await\s+/,
    explain: () => `Waits for a promise to resolve before continuing`,
    icon: 'async',
  },
  asyncFunction: {
    regex: /async\s+/,
    explain: () => `Marks a function as asynchronous (returns a Promise)`,
    icon: 'async',
  },
  comment: {
    regex: /^\s*(\/\/|\/\*|\*)/,
    explain: (match) => `Comment: ${match[0].trim().replace(/^(\/\/|\/\*|\*)\s*/, '') || 'documentation note'}`,
    icon: 'comment',
  },
  emptyLine: {
    regex: /^\s*$/,
    explain: () => ``,
    icon: 'empty',
  },
  ternaryOperator: {
    regex: /\?\s*.*\s*:/,
    explain: () => `Ternary operator — inline conditional expression`,
    icon: 'condition',
  },
  optionalChaining: {
    regex: /\?\./,
    explain: () => `Optional chaining — safely accesses nested properties`,
    icon: 'access',
  },
  nullishCoalescing: {
    regex: /\?\?/,
    explain: () => `Nullish coalescing — uses fallback for null/undefined values`,
    icon: 'access',
  },
  spreadOperator: {
    regex: /\.\.\./,
    explain: () => `Spread operator — expands an iterable into individual elements`,
    icon: 'operator',
  },
  templateLiteral: {
    regex: /`[^`]*\$\{/,
    explain: () => `Template literal with embedded expression`,
    icon: 'string',
  },
  promiseChain: {
    regex: /\.then\s*\(/,
    explain: () => `Promise chain — handles resolved value from previous promise`,
    icon: 'async',
  },
  typeAnnotation: {
    regex: /:\s*(string|number|boolean|any|void|never|object|Array|Promise)\b/,
    explain: (match) => `Type annotation — explicitly types value as \`${match[1]}\``,
    icon: 'type',
  },
};

const COMPLEXITY_PATTERNS = {
  nestedLoop: { regex: /for\s*\([\s\S]*?\{[\s\S]*?for\s*\(/, complexity: 'O(n²)', label: 'Quadratic' },
  singleLoop: { regex: /(?:for|while|\.forEach|\.map|\.filter)\s*\(/, complexity: 'O(n)', label: 'Linear' },
  binarySearch: { regex: /(?:mid|middle|low|high|left|right)[\s\S]*?(?:\/|>>|Math\.floor)/, complexity: 'O(log n)', label: 'Logarithmic' },
  noLoop: { regex: /^(?!.*(?:for|while|\.forEach|\.map|\.filter))[\s\S]*$/, complexity: 'O(1)', label: 'Constant' },
};

const SPACE_PATTERNS = {
  createsArray: { regex: /(?:new Array|Array\.from|\[\]|\.map\(|\.filter\()/, space: 'O(n)', label: 'Linear' },
  nestedStructures: { regex: /(?:Object\.fromEntries|Object\.assign|\{\}[\s\S]*?\{\})/, space: 'O(n²)', label: 'Quadratic' },
  recursion: { regex: /function\s+\w+[\s\S]*?\w+\s*\(/, space: 'O(n)', label: 'Linear (call stack)' },
  noExtraSpace: { regex: /^(?!.*(?:new Array|Array\.from|\[\s*\]|Object\.fromEntries))[\s\S]*$/, space: 'O(1)', label: 'Constant' },
};

const LANGUAGE_LABELS = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  go: 'Go',
  rust: 'Rust',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
};

const LANGUAGE_COLORS = {
  javascript: 'from-yellow-400 to-yellow-600',
  typescript: 'from-blue-400 to-blue-600',
  python: 'from-green-400 to-green-600',
  java: 'from-red-400 to-red-600',
  cpp: 'from-blue-500 to-indigo-600',
  c: 'from-gray-400 to-gray-600',
  go: 'from-cyan-400 to-cyan-600',
  rust: 'from-orange-400 to-orange-600',
  ruby: 'from-red-400 to-pink-600',
  php: 'from-purple-400 to-purple-600',
  swift: 'from-orange-400 to-red-500',
  kotlin: 'from-purple-400 to-indigo-500',
};

function analyzeCode(code, language) {
  if (!code || !code.trim()) return null;

  const lines = code.split('\n');
  const lineExplanations = [];
  const conceptsFound = new Set();
  const mistakesToFlag = [];
  const optimizations = [];

  let totalLoops = 0;
  let nestedLoops = 0;
  let hasAsync = false;
  let hasErrorHandling = false;
  let hasRecursion = false;
  let functionCount = 0;
  let maxLineLength = 0;
  let commentCount = 0;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    let explanation = null;
    let matchedPattern = null;

    for (const [, pattern] of Object.entries(PATTERNS)) {
      const match = trimmed.match(pattern.regex);
      if (match) {
        explanation = pattern.explain(match);
        matchedPattern = pattern.icon;
        break;
      }
    }

    if (!explanation && trimmed) {
      if (trimmed.includes('=') && (trimmed.startsWith('const') || trimmed.startsWith('let') || trimmed.startsWith('var'))) {
        explanation = `Declares a variable`;
        matchedPattern = 'variable';
      } else if (trimmed.includes('(') && trimmed.includes(')') && trimmed.includes('{')) {
        explanation = `Defines a code block`;
        matchedPattern = 'function';
      } else {
        explanation = `Executes: \`${trimmed.length > 40 ? trimmed.slice(0, 40) + '...' : trimmed}\``;
        matchedPattern = 'statement';
      }
    }

    if (explanation) {
      lineExplanations.push({
        lineNumber: index + 1,
        code: line,
        explanation,
        icon: matchedPattern,
      });
    }

    if (trimmed.match(/for\s*\(/)) {
      totalLoops++;
      conceptsFound.add('Iteration');
    }
    if (trimmed.match(/\.map\s*\(/)) {
      totalLoops++;
      conceptsFound.add('Array Mapping');
      conceptsFound.add('Functional Programming');
    }
    if (trimmed.match(/\.filter\s*\(/)) {
      totalLoops++;
      conceptsFound.add('Array Filtering');
      conceptsFound.add('Functional Programming');
    }
    if (trimmed.match(/\.reduce\s*\(/)) {
      conceptsFound.add('Array Reduction');
      conceptsFound.add('Functional Programming');
    }
    if (trimmed.match(/\.sort\s*\(/)) {
      conceptsFound.add('Sorting');
    }
    if (trimmed.match(/\.find\s*\(/)) {
      conceptsFound.add('Search');
    }
    if (trimmed.match(/async|await|\.then\s*\(/)) {
      hasAsync = true;
      conceptsFound.add('Asynchronous Programming');
      conceptsFound.add('Promises');
    }
    if (trimmed.match(/try|catch|throw/)) {
      hasErrorHandling = true;
      conceptsFound.add('Error Handling');
    }
    if (trimmed.match(/class\s+\w+/)) {
      conceptsFound.add('Object-Oriented Programming');
    }
    if (trimmed.match(/extends|implements/)) {
      conceptsFound.add('Inheritance');
    }
    if (trimmed.match(/constructor/)) {
      conceptsFound.add('Constructor Pattern');
    }
    if (trimmed.match(/import|require/)) {
      conceptsFound.add('Module System');
    }
    if (trimmed.match(/export/)) {
      conceptsFound.add('Module System');
    }
    if (trimmed.match(/(?:const|let)\s+\w+\s*=\s*(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>/)) {
      functionCount++;
      conceptsFound.add('Arrow Functions');
      conceptsFound.add('Functional Programming');
    }
    if (trimmed.match(/function\s+\w+/)) {
      functionCount++;
      conceptsFound.add('Function Declarations');
    }
    if (trimmed.match(/\?\./)) {
      conceptsFound.add('Optional Chaining');
    }
    if (trimmed.match(/\?\?/)) {
      conceptsFound.add('Nullish Coalescing');
    }
    if (trimmed.match(/===|!==/)) {
      conceptsFound.add('Strict Equality');
    }
    if (trimmed.match(/(?:const|let)\s*\{/)) {
      conceptsFound.add('Destructuring');
    }
    if (trimmed.match(/`[^`]*\$\{/)) {
      conceptsFound.add('Template Literals');
    }
    if (trimmed.match(/\.\.\./) && !trimmed.match(/function|class/)) {
      conceptsFound.add('Spread/Rest Operator');
    }
    if (trimmed.match(/typeof\s+/)) {
      conceptsFound.add('Type Checking');
    }
    if (trimmed.match(/instanceof\s+/)) {
      conceptsFound.add('Type Checking');
    }
    if (trimmed.match(/JSON\.(parse|stringify)/)) {
      conceptsFound.add('JSON Manipulation');
    }
    if (trimmed.match(/setTimeout|setInterval/)) {
      conceptsFound.add('Timers');
    }
    if (trimmed.match(/(?:document|window)\./)) {
      conceptsFound.add('DOM Manipulation');
    }
    if (trimmed.match(/(?:useEffect|useState|useRef|useMemo|useCallback)/)) {
      conceptsFound.add('React Hooks');
    }
    if (trimmed.match(/\/\/|\/\*/)) {
      commentCount++;
      conceptsFound.add('Code Documentation');
    }

    if (trimmed.length > 100) {
      maxLineLength = Math.max(maxLineLength, trimmed.length);
    }
  });

  const nestedLoopRegex = /for\s*\([\s\S]*?\{[\s\S]*?for\s*\(/;
  if (nestedLoopRegex.test(code)) {
    nestedLoops = 1;
  }

  if (totalLoops >= 2 && !nestedLoopRegex.test(code)) {
    nestedLoops = 0;
  }

  let timeComplexity = 'O(1)';
  let timeLabel = 'Constant';
  if (nestedLoops > 0) {
    timeComplexity = 'O(n²)';
    timeLabel = 'Quadratic';
  } else if (totalLoops > 0) {
    timeComplexity = 'O(n)';
    timeLabel = 'Linear';
  }
  if (hasAsync) {
    timeLabel += ' (async I/O excluded)';
  }

  let spaceComplexity = 'O(1)';
  let spaceLabel = 'Constant';
  if (code.match(/new Array|Array\.from|\[\s*\]|\.map\(|\.filter\(/)) {
    spaceComplexity = 'O(n)';
    spaceLabel = 'Linear';
  }
  if (hasRecursion || code.match(/(?:function)\s+\w+[\s\S]*?\1\s*\(/)) {
    spaceComplexity = 'O(n)';
    spaceLabel = 'Linear (call stack)';
  }

  if (!hasErrorHandling && (hasAsync || totalLoops > 0)) {
    mistakesToFlag.push({
      title: 'Missing error handling',
      description: 'Consider adding try/catch blocks around async operations or risky code.',
    });
  }

  if (totalLoops > 2) {
    mistakesToFlag.push({
      title: 'Multiple sequential loops detected',
      description: 'Consider chaining array methods or combining loops to reduce passes over data.',
    });
  }

  if (code.match(/var\s+/)) {
    mistakesToFlag.push({
      title: 'Using `var` instead of `const`/`let`',
      description: '`var` has function scope and can lead to unexpected hoisting behavior. Prefer `const` or `let`.',
    });
  }

  if (code.match(/==(?!=)/g)) {
    mistakesToFlag.push({
      title: 'Loose equality (`==`) detected',
      description: 'Use strict equality (`===`) to avoid type coercion bugs.',
    });
  }

  if (maxLineLength > 120) {
    mistakesToFlag.push({
      title: 'Lines exceed 120 characters',
      description: 'Long lines reduce readability. Consider breaking into smaller statements.',
    });
  }

  if (code.match(/console\.(log|warn|error)/)) {
    mistakesToFlag.push({
      title: 'Console statements in code',
      description: 'Remove console logs before production deployment.',
    });
  }

  if (functionCount > 5) {
    optimizations.push({
      title: 'Consider extracting helper functions',
      description: `Found ${functionCount} function definitions. Group related logic into well-named helper functions for better readability.`,
    });
  }

  if (nestedLoops > 0) {
    optimizations.push({
      title: 'Optimize nested loops',
      description: 'Nested loops create O(n²) complexity. Consider using a hash map or Set for O(1) lookups to replace inner loops.',
    });
  }

  if (totalLoops >= 3) {
    optimizations.push({
      title: 'Reduce iteration passes',
      description: 'Multiple loops over the same data can often be combined into a single pass using `.reduce()` or a combined filter-map pattern.',
    });
  }

  if (!code.match(/\/\/|\/\*/)) {
    optimizations.push({
      title: 'Add code comments',
      description: 'No comments found. Add JSDoc or inline comments for complex logic to help future maintainers.',
    });
  }

  if (code.match(/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*return[\s\S]*\}/)) {
    const hasMemo = code.match(/useMemo|useCallback|React\.memo/);
    if (!hasMemo && code.match(/(?:React|component|Component)/)) {
      optimizations.push({
        title: 'Consider memoization',
        description: 'For React components, memoize expensive computations with `useMemo` or stable references with `useCallback`.',
      });
    }
  }

  if (mistakesToFlag.length === 0) {
    mistakesToFlag.push({
      title: 'No common issues detected',
      description: 'Your code follows good practices. Keep it up!',
    });
  }

  if (optimizations.length === 0) {
    optimizations.push({
      title: 'Code looks clean',
      description: 'No major optimizations needed for this snippet. Well written!',
    });
  }

  return {
    lineExplanations,
    timeComplexity,
    timeLabel,
    spaceComplexity,
    spaceLabel,
    keyConcepts: Array.from(conceptsFound),
    commonMistakes: mistakesToFlag,
    optimizations,
    stats: {
      totalLines: lines.length,
      codeLines: lines.filter((l) => l.trim() && !l.trim().match(/^(\/\/|\/\*)/)).length,
      commentLines: commentCount,
      functionCount,
      loopCount: totalLoops,
    },
  };
}

function ComplexityCard({ icon: Icon, label, value, sublabel, color }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{sublabel}</p>
      </div>
    </div>
  );
}

function LineExplanation({ item, index }) {
  const [expanded, setExpanded] = useState(false);

  const iconMap = {
    function: <Code className="w-3.5 h-3.5" />,
    class: <Code className="w-3.5 h-3.5" />,
    import: <FileCode className="w-3.5 h-3.5" />,
    export: <FileCode className="w-3.5 h-3.5" />,
    return: <ChevronRight className="w-3.5 h-3.5" />,
    loop: <RefreshCw className="w-3.5 h-3.5" />,
    condition: <AlertTriangle className="w-3.5 h-3.5" />,
    error: <AlertTriangle className="w-3.5 h-3.5" />,
    output: <CheckCircle className="w-3.5 h-3.5" />,
    variable: <FileCode className="w-3.5 h-3.5" />,
    async: <Clock className="w-3.5 h-3.5" />,
    comment: <BookOpen className="w-3.5 h-3.5" />,
    access: <Code className="w-3.5 h-3.5" />,
    operator: <Code className="w-3.5 h-3.5" />,
    string: <Code className="w-3.5 h-3.5" />,
    type: <Code className="w-3.5 h-3.5" />,
    statement: <Code className="w-3.5 h-3.5" />,
  };

  const colorMap = {
    function: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    class: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    import: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    export: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    return: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    loop: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    condition: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    error: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    output: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    variable: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
    async: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    comment: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
    access: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    operator: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
    string: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400',
    type: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
    statement: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  const icon = iconMap[item.icon] || iconMap.statement;
  const color = colorMap[item.icon] || colorMap.statement;

  if (item.icon === 'empty') return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      className="group border border-gray-100 dark:border-gray-700/50 rounded-lg hover:border-primary-200 dark:hover:border-primary-800/50 transition-colors"
    >
      <div
        className="flex items-start gap-3 p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500 w-8 text-right shrink-0">
            {item.lineNumber}
          </span>
          <div className={`shrink-0 w-6 h-6 rounded flex items-center justify-center ${color}`}>
            {icon}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
            {item.explanation}
          </p>
        </div>
        <button className="shrink-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0">
              <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg p-3 text-xs font-mono text-gray-300 overflow-x-auto">
                <code>{item.code}</code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SectionCard({ title, icon: Icon, color, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-6"
      >
        <Brain className="w-8 h-8 text-white" />
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Analyzing your code...
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
        Our AI is examining patterns, complexity, and best practices
      </p>
      <div className="flex gap-1 mt-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onPaste }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-6">
        <Code className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No code to analyze
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
        Paste some code into the editor or click the button below to analyze code from your clipboard.
      </p>
      <button
        onClick={onPaste}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-colors shadow-sm"
      >
        <Clipboard className="w-4 h-4" />
        Paste from Clipboard
      </button>
    </div>
  );
}

export default function AIExplanationPanel({ code = '', language = 'javascript' }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('lines');

  const runAnalysis = useCallback(
    (codeToAnalyze) => {
      setIsAnalyzing(true);
      setAnalysis(null);

      setTimeout(() => {
        const result = analyzeCode(codeToAnalyze || code, language);
        setAnalysis(result);
        setIsAnalyzing(false);
      }, 600 + Math.random() * 800);
    },
    [code, language]
  );

  useEffect(() => {
    if (code && code.trim()) {
      runAnalysis(code);
    } else {
      setAnalysis(null);
    }
  }, [code, language, runAnalysis]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        runAnalysis(text);
      }
    } catch {
      alert('Unable to access clipboard. Please paste code manually.');
    }
  };

  const langLabel = LANGUAGE_LABELS[language] || language;
  const langColor = LANGUAGE_COLORS[language] || 'from-gray-400 to-gray-600';

  const tabs = [
    { id: 'lines', label: 'Line Analysis', icon: Code },
    { id: 'optimizations', label: 'Optimizations', icon: Zap },
    { id: 'mistakes', label: 'Mistakes', icon: AlertTriangle },
    { id: 'concepts', label: 'Concepts', icon: BookOpen },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-r ${langColor} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Code Analysis</h2>
              <p className="text-white/80 text-xs">
                {langLabel} &middot; Powered by AI Pattern Recognition
              </p>
            </div>
          </div>
          <button
            onClick={handlePaste}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors"
          >
            {copied ? (
              <ClipboardCheck className="w-4 h-4" />
            ) : (
              <Clipboard className="w-4 h-4" />
            )}
            Paste Code
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isAnalyzing ? (
          <LoadingState />
        ) : !analysis ? (
          <EmptyState onPaste={handlePaste} />
        ) : (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-px bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              {[
                { label: 'Total Lines', value: analysis.stats.totalLines },
                { label: 'Code Lines', value: analysis.stats.codeLines },
                { label: 'Functions', value: analysis.stats.functionCount },
                { label: 'Loops', value: analysis.stats.loopCount },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white dark:bg-gray-900 py-3 px-4 text-center"
                >
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Complexity */}
            <div className="grid grid-cols-2 gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
              <ComplexityCard
                icon={Clock}
                label="Time Complexity"
                value={analysis.timeComplexity}
                sublabel={analysis.timeLabel}
                color="bg-gradient-to-br from-blue-500 to-blue-700"
              />
              <ComplexityCard
                icon={Zap}
                label="Space Complexity"
                value={analysis.spaceComplexity}
                sublabel={analysis.spaceLabel}
                color="bg-gradient-to-br from-purple-500 to-purple-700"
              />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                {activeTab === 'lines' && (
                  <motion.div
                    key="lines"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-2"
                  >
                    {analysis.lineExplanations.map((item, i) => (
                      <LineExplanation key={item.lineNumber} item={item} index={i} />
                    ))}
                  </motion.div>
                )}

                {activeTab === 'optimizations' && (
                  <motion.div
                    key="optimizations"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3"
                  >
                    {analysis.optimizations.map((opt, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30"
                      >
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-300 text-sm">
                            {opt.title}
                          </p>
                          <p className="text-green-700 dark:text-green-400 text-xs mt-1">
                            {opt.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'mistakes' && (
                  <motion.div
                    key="mistakes"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3"
                  >
                    {analysis.commonMistakes.map((mistake, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30"
                      >
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-amber-900 dark:text-amber-300 text-sm">
                            {mistake.title}
                          </p>
                          <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
                            {mistake.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'concepts' && (
                  <motion.div
                    key="concepts"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {analysis.keyConcepts.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysis.keyConcepts.map((concept) => (
                          <span
                            key={concept}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/30"
                          >
                            <Lightbulb className="w-3 h-3" />
                            {concept}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                        No specific concepts identified in this code snippet.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
