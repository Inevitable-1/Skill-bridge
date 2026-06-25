const KNOWLEDGE_BASE = {
  javascript: {
    keywords: ['javascript', 'js', 'es6', 'es2015', 'var', 'let', 'const', 'function', 'arrow function', 'callback', 'promise', 'async', 'await', 'closure', 'hoisting', 'prototype', 'this', 'event loop', 'dom', 'spread', 'destructuring', 'module', 'import', 'export'],
    concepts: {
      'variable': {
        explanation: 'In JavaScript, variables store data values. There are three ways to declare them:',
        steps: [
          '`var` - Function-scoped, can be redeclared and reassigned. Avoid in modern code.',
          '`let` - Block-scoped, can be reassigned but not redeclared in same scope.',
          '`const` - Block-scoped, cannot be reassigned or redeclared. Use for constants.',
        ],
        example: '```javascript\nlet age = 25;\nconst name = "Alice";\nvar oldWay = "avoid";\n```',
        practice: 'Create variables of each type and try reassigning them. Observe the errors.',
        resources: ['MDN: Variables', 'JavaScript.info: Variables'],
      },
      'arrow function': {
        explanation: 'Arrow functions provide a shorter syntax for writing functions and lexically bind `this`.',
        steps: [
          'Use `=>` syntax instead of `function` keyword.',
          'Single expression functions can omit `return` and curly braces.',
          'Multiple statements require curly braces and explicit `return`.',
          'Arrow functions do not have their own `this` context.',
        ],
        example: '```javascript\nconst add = (a, b) => a + b;\nconst greet = name => `Hello, ${name}!`;\nconst complex = (x) => {\n  const result = x * 2;\n  return result;\n};\n```',
        practice: 'Convert regular functions to arrow functions. Try using `this` inside both.',
        resources: ['MDN: Arrow Functions', 'JavaScript.info: Arrow Functions'],
      },
      'async await': {
        explanation: 'async/await is syntactic sugar over Promises, making asynchronous code look synchronous.',
        steps: [
          'Mark a function with `async` to enable `await` inside it.',
          'Use `await` before a Promise to wait for its resolution.',
          'Wrap await calls in try/catch for error handling.',
          'async functions always return a Promise.',
        ],
        example: '```javascript\nasync function fetchUser(id) {\n  try {\n    const response = await fetch(`/api/users/${id}`);\n    const user = await response.json();\n    return user;\n  } catch (error) {\n    console.error("Failed:", error);\n  }\n}\n```',
        practice: 'Write a function that fetches data from a public API using async/await.',
        resources: ['MDN: async/await', 'JavaScript.info: Promises'],
      },
      'promise': {
        explanation: 'A Promise represents the eventual completion or failure of an asynchronous operation.',
        steps: [
          'Create with `new Promise((resolve, reject) => { ... })`.',
          'Call `resolve(value)` on success, `reject(error)` on failure.',
          'Chain with `.then()` for success, `.catch()` for errors.',
          'Use `Promise.all()` for parallel operations.',
        ],
        example: '```javascript\nconst fetchData = () => {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => resolve("Done!"), 1000);\n  });\n};\n\nfetchData().then(console.log); // "Done!" after 1s\n```',
        practice: 'Create a Promise-based function that simulates a network request.',
        resources: ['MDN: Promises', 'JavaScript.info: Promises'],
      },
      'closure': {
        explanation: 'A closure is a function that retains access to variables from its outer scope even after the outer function has returned.',
        steps: [
          'A closure is created when a function is defined inside another function.',
          'The inner function "closes over" variables from the outer function.',
          'These variables persist as long as the inner function exists.',
          'Closures are used for data privacy, function factories, and callbacks.',
        ],
        example: '```javascript\nfunction counter() {\n  let count = 0;\n  return {\n    increment: () => ++count,\n    getCount: () => count\n  };\n}\nconst c = counter();\nc.increment(); // 1\nc.increment(); // 2\nc.getCount();  // 2\n```',
        practice: 'Create a private counter using closures with increment, decrement, and reset methods.',
        resources: ['MDN: Closures', 'JavaScript.info: Closer'],
      },
      'event loop': {
        explanation: 'The event loop is the mechanism that handles asynchronous operations in JavaScript.',
        steps: [
          'JavaScript is single-threaded with a call stack.',
          'Web APIs (setTimeout, fetch) run outside the call stack.',
          'Callbacks go to the Task Queue (macrotasks) or Microtask Queue.',
          'Microtasks (Promises) have higher priority than macrotasks.',
          'The event loop checks the call stack; if empty, it processes the next queue.',
        ],
        example: '```javascript\nconsole.log("1");           // Sync\nsetTimeout(() => console.log("2"), 0); // Macrotask\nPromise.resolve().then(() => console.log("3")); // Microtask\nconsole.log("4");           // Sync\n// Output: 1, 4, 3, 2\n```',
        practice: 'Predict the output of nested setTimeout, Promise, and console.log combinations.',
        resources: ['JavaScript.info: Event Loop', 'MDN: Concurrency Model'],
      },
      'destructuring': {
        explanation: 'Destructuring extracts values from arrays or properties from objects into distinct variables.',
        steps: [
          'Object destructuring: `const { name, age } = person;`',
          'Array destructuring: `const [first, second] = arr;`',
          'Can set defaults: `const { name = "Anonymous" } = obj;`',
          'Can rename: `const { name: userName } = obj;`',
          'Nested destructuring works too.',
        ],
        example: '```javascript\nconst user = { name: "Alice", age: 25, address: { city: "NYC" } };\nconst { name, age, address: { city } } = user;\n\nconst colors = ["red", "green", "blue"];\nconst [primary, secondary] = colors;\n```',
        practice: 'Destructure a nested API response object into individual variables.',
        resources: ['MDN: Destructuring Assignment'],
      },
      'spread': {
        explanation: 'The spread operator (...) expands an iterable into individual elements.',
        steps: [
          'Array spread: `const newArr = [...oldArr, extra];`',
          'Object spread: `const newObj = { ...oldObj, extra };`',
          'Function arguments: `fn(...args)`',
          'Can be used for shallow copies and merging.',
        ],
        example: '```javascript\nconst arr1 = [1, 2, 3];\nconst arr2 = [...arr1, 4, 5]; // [1,2,3,4,5]\n\nconst obj1 = { a: 1, b: 2 };\nconst obj2 = { ...obj1, c: 3 }; // {a:1, b:2, c:3}\n```',
        practice: 'Use spread to merge arrays, clone objects, and pass dynamic arguments.',
        resources: ['MDN: Spread Syntax'],
      },
      'module': {
        explanation: 'ES Modules allow you to split code into reusable files with import/export.',
        steps: [
          'Export: `export const name = "value";`',
          'Default export: `export default function() {}`',
          'Import named: `import { name } from "./module";`',
          'Import default: `import myFunc from "./module";`',
          'Modules have their own scope (no global pollution).',
        ],
        example: '```javascript\n// math.js\nexport const add = (a, b) => a + b;\nexport const subtract = (a, b) => a - b;\n\n// app.js\nimport { add, subtract } from "./math.js";\nconsole.log(add(2, 3));\n```',
        practice: 'Split a small app into modules with proper imports/exports.',
        resources: ['MDN: ES Modules', 'JavaScript.info: Modules'],
      },
    },
  },
  react: {
    keywords: ['react', 'component', 'jsx', 'hook', 'state', 'props', 'effect', 'context', 'ref', 'memo', 'usestate', 'useeffect', 'virtual dom', 'lifecycle', 'render'],
    concepts: {
      'component': {
        explanation: 'React components are reusable UI pieces that return JSX (a syntax extension for HTML in JS).',
        steps: [
          'Functional components are functions that return JSX.',
          'Components receive data via props (properties).',
          'Use hooks like useState for state management.',
          'Components re-render when state or props change.',
          'Keep components small and focused on one task.',
        ],
        example: '```jsx\nfunction Greeting({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n\n// Usage\n<Greeting name="Alice" />\n```',
        practice: 'Create a UserCard component that displays name, email, and avatar from props.',
        resources: ['React Docs: Components', 'React Tutorial'],
      },
      'state': {
        explanation: 'State is data managed within a component that triggers re-renders when changed.',
        steps: [
          'Declare with `const [value, setValue] = useState(initialValue);`',
          'Update with the setter function: `setValue(newValue);`',
          'State updates are asynchronous (batched).',
          'Never modify state directly; always use the setter.',
          'For complex state, use useReducer or spread operator.',
        ],
        example: '```jsx\nimport { useState } from "react";\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Count: {count}\n    </button>\n  );\n}\n```',
        practice: 'Build a toggle switch and a character counter using useState.',
        resources: ['React Docs: useState', 'Hooks FAQ'],
      },
      'useeffect': {
        explanation: 'useEffect handles side effects like data fetching, subscriptions, and DOM manipulation.',
        steps: [
          'Runs after every render by default.',
          'Add a dependency array to control when it runs.',
          'Empty array `[]` = runs once on mount.',
          'Return a cleanup function to run before next effect or unmount.',
          'Dependencies should be stable references.',
        ],
        example: '```jsx\nimport { useState, useEffect } from "react";\n\nfunction UserProfile({ userId }) {\n  const [user, setUser] = useState(null);\n  \n  useEffect(() => {\n    fetch(`/api/users/${userId}`)\n      .then(res => res.json())\n      .then(setUser);\n    return () => {};\n  }, [userId]);\n  \n  return user ? <div>{user.name}</div> : <div>Loading...</div>;\n}\n```',
        practice: 'Fetch data from a public API and handle loading/error states.',
        resources: ['React Docs: useEffect', 'Complete Guide to useEffect'],
      },
      'props': {
        explanation: 'Props (properties) are read-only data passed from parent to child components.',
        steps: [
          'Pass as attributes: `<Child name="Alice" age={25} />`',
          'Receive as function parameter: `function Child({ name, age })`',
          'Can pass functions as props for child-to-parent communication.',
          'Props are immutable; never modify them inside a child.',
          'Use default parameters for optional props.',
        ],
        example: '```jsx\nfunction UserCard({ name, email, avatar, onFollow }) {\n  return (\n    <div>\n      <img src={avatar} alt={name} />\n      <h2>{name}</h2>\n      <p>{email}</p>\n      <button onClick={onFollow}>Follow</button>\n    </div>\n  );\n}\n```',
        practice: 'Create a parent-child component hierarchy passing different data types as props.',
        resources: ['React Docs: Props', 'Thinking in React'],
      },
    },
  },
  python: {
    keywords: ['python', 'pip', 'list', 'dict', 'tuple', 'set', 'class', 'object', 'def', 'lambda', 'comprehension', 'decorator', 'generator', 'virtual environment', 'flask', 'django'],
    concepts: {
      'list comprehension': {
        explanation: 'List comprehensions provide a concise way to create lists.',
        steps: [
          'Syntax: `[expression for item in iterable if condition]`',
          'Can include conditions to filter items.',
          'Can nest multiple for loops.',
          'More readable and often faster than equivalent loops.',
        ],
        example: '```python\n# Basic\nsquares = [x**2 for x in range(10)]\n\n# With condition\nevens = [x for x in range(20) if x % 2 == 0]\n\n# Nested\nmatrix = [[i*j for j in range(3)] for i in range(3)]\n```',
        practice: 'Convert 3 for-loop based list constructions to list comprehensions.',
        resources: ['Python Docs: List Comprehensions', 'Real Python: Comprehensions'],
      },
      'decorator': {
        explanation: 'Decorators modify the behavior of functions or classes without changing their source code.',
        steps: [
          'A decorator is a function that takes a function and returns a modified version.',
          'Use `@decorator_name` syntax above the function definition.',
          'The decorated function runs inside the wrapper.',
          'Common uses: logging, authentication, caching, timing.',
        ],
        example: '```python\ndef timer(func):\n    import time\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        print(f"{func.__name__} took {time.time()-start:.2f}s")\n        return result\n    return wrapper\n\n@timer\ndef slow_function():\n    import time\n    time.sleep(1)\n```',
        practice: 'Create a decorator that logs function arguments and return values.',
        resources: ['Real Python: Decorators', 'Python Docs: Decorators'],
      },
      'class': {
        explanation: 'Classes in Python implement object-oriented programming with encapsulation and inheritance.',
        steps: [
          'Define with `class ClassName:`.',
          'Use `__init__` as the constructor method.',
          'Instance methods take `self` as the first parameter.',
          'Use `@property` for getters, `@name.setter` for setters.',
          'Inheritance: `class Child(Parent):`.',
        ],
        example: '```python\nclass Animal:\n    def __init__(self, name, sound):\n        self.name = name\n        self.sound = sound\n    \n    def speak(self):\n        return f"{self.name} says {self.sound}!"\n\nclass Dog(Animal):\n    def __init__(self, name):\n        super().__init__(name, "Woof")\n\ndog = Dog("Buddy")\nprint(dog.speak())  # Buddy says Woof!\n```',
        practice: 'Create a BankAccount class with deposit, withdraw, and balance methods.',
        resources: ['Python Docs: Classes', 'Real Python: OOP'],
      },
      'dictionary': {
        explanation: 'Dictionaries store key-value pairs and are one of the most versatile data structures.',
        steps: [
          'Create with `{}` or `dict()`.',
          'Access values with `dict[key]` or `dict.get(key, default)`.',
          'Add/update: `dict[key] = value`.',
          'Remove: `del dict[key]` or `dict.pop(key)`.',
          'Iterate: `for key, value in dict.items():`',
        ],
        example: '```python\nperson = {"name": "Alice", "age": 25}\n\n# Access\nprint(person["name"])  # Alice\nprint(person.get("email", "N/A"))  # N/A\n\n# Add\nperson["email"] = "alice@example.com"\n\n# Iterate\nfor key, value in person.items():\n    print(f"{key}: {value}")\n```',
        practice: 'Build a simple phonebook application using dictionaries.',
        resources: ['Python Docs: Dictionaries'],
      },
    },
  },
  datastructures: {
    keywords: ['array', 'linked list', 'stack', 'queue', 'tree', 'binary tree', 'hash', 'graph', 'algorithm', 'sorting', 'searching', 'recursion', 'dynamic programming', 'big o', 'time complexity', 'space complexity', 'data structure'],
    concepts: {
      'array': {
        explanation: 'Arrays store elements in contiguous memory, allowing O(1) access by index.',
        steps: [
          'Index-based access: `arr[i]` is O(1).',
          'Insertion/deletion at end is O(1) amortized.',
          'Insertion/deletion at middle is O(n) due to shifting.',
          'Use when you need fast random access.',
          'Know the difference from dynamic arrays (ArrayList, vector).',
        ],
        example: '```python\n# Static array concept\narr = [10, 20, 30, 40, 50]\nprint(arr[2])     # 30 - O(1)\narr.append(60)    # O(1) amortized\narr.insert(1, 15) # O(n) - shifts elements\n```',
        practice: 'Implement a dynamic array class with push, pop, and get methods.',
        resources: ['Visualgo: Arrays', 'GeeksforGeeks: Arrays'],
      },
      'stack': {
        explanation: 'A stack is LIFO (Last In, First Out) - think of a pile of plates.',
        steps: [
          'Push: Add element to top. Pop: Remove from top. Both O(1).',
          'Peek/Top: View top element without removing.',
          'Use cases: undo/redo, function call stack, expression evaluation, backtracking.',
          'Can implement with arrays or linked lists.',
        ],
        example: '```python\nstack = []\nstack.append(1)  # push\nstack.append(2)\nstack.pop()      # returns 2 (LIFO)\nstack[-1]        # peek: returns 1\n```',
        practice: 'Implement a stack and use it to check balanced parentheses.',
        resources: ['Visualgo: Stack', 'GeeksforGeeks: Stack'],
      },
      'queue': {
        explanation: 'A queue is FIFO (First In, First Out) - like a line at a store.',
        steps: [
          'Enqueue: Add to back. Dequeue: Remove from front. Both O(1).',
          'Use collections.deque in Python for O(1) operations.',
          'Use cases: BFS, task scheduling, print queues.',
          'Variants: priority queue, circular queue, deque.',
        ],
        example: '```python\nfrom collections import deque\n\nqueue = deque()\nqueue.append("A")   # enqueue\nqueue.append("B")\nqueue.popleft()     # dequeues "A" (FIFO)\n```',
        practice: 'Implement a queue using two stacks.',
        resources: ['Visualgo: Queue', 'GeeksforGeeks: Queue'],
      },
      'binary tree': {
        explanation: 'A binary tree has at most two children per node. Binary Search Trees (BST) maintain sorted order.',
        steps: [
          'Each node has: value, left child, right child.',
          'BST property: left < root < right for all nodes.',
          'Traversal: Inorder (sorted), Preorder, Postorder, Level-order.',
          'Search/Insert average: O(log n). Worst: O(n) if unbalanced.',
          'Balanced trees (AVL, Red-Black) guarantee O(log n).',
        ],
        example: '```python\nclass TreeNode:\n    def __init__(self, val=0):\n        self.val = val\n        self.left = None\n        self.right = None\n\ndef inorder(node):\n    if node:\n        inorder(node.left)\n        print(node.val)\n        inorder(node.right)\n```',
        practice: 'Implement BST insert, search, and inorder traversal.',
        resources: ['Visualgo: BST', 'GeeksforGeeks: Binary Tree'],
      },
      'hash table': {
        explanation: 'Hash tables map keys to values using a hash function for O(1) average access.',
        steps: [
          'Hash function converts key to array index.',
          'Collisions handled by chaining (linked lists) or open addressing.',
          'Average: O(1) insert/search/delete. Worst: O(n) with many collisions.',
          'Load factor = elements/s buckets. Resize when > 0.75.',
          'Python dicts and sets are hash table implementations.',
        ],
        example: '```python\nhash_map = {}\nhash_map["key1"] = "value1"  # O(1) insert\nhash_map["key1"]             # O(1) lookup\ndel hash_map["key1"]         # O(1) delete\n\n# Using dict comprehension\nsquares = {x: x**2 for x in range(5)}\n```',
        practice: 'Implement a simple hash table with chaining for collision resolution.',
        resources: ['Visualgo: Hash Table', 'GeeksforGeeks: Hashing'],
      },
    },
  },
  webdev: {
    keywords: ['html', 'css', 'dom', 'http', 'api', 'rest', 'json', 'frontend', 'backend', 'server', 'database', 'sql', 'nosql', 'git', 'github', 'npm', 'node', 'express', 'nginx', 'cors', 'authentication', 'jwt', 'oauth', 'responsive', 'flexbox', 'grid', 'tailwind', 'bootstrap'],
    concepts: {
      'http': {
        explanation: 'HTTP (HyperText Transfer Protocol) is the foundation of data communication on the web.',
        steps: [
          'Client sends a request (GET, POST, PUT, DELETE, PATCH).',
          'Server responds with a status code (200, 404, 500, etc.).',
          'Headers carry metadata (Content-Type, Authorization, etc.).',
          'Stateless: each request is independent (use sessions/cookies for state).',
          'HTTPS adds TLS encryption for security.',
        ],
        example: '```\nGET /api/users HTTP/1.1\nHost: example.com\nAuthorization: Bearer token123\n\n---\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{"users": [...]}\n```',
        practice: 'Use browser DevTools Network tab to inspect real HTTP requests.',
        resources: ['MDN: HTTP', 'HTTP Dog Status Codes'],
      },
      'rest api': {
        explanation: 'REST (Representational State Transfer) is an architectural style for designing APIs.',
        steps: [
          'Resources are identified by URLs: `/api/users`, `/api/posts`',
          'Use HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove)',
          'Stateless: server doesn\'t store client state between requests.',
          'Return JSON for data transfer.',
          'Use proper status codes: 201 Created, 404 Not Found, etc.',
        ],
        example: '```\nGET    /api/users         - List users\nPOST   /api/users         - Create user\nGET    /api/users/:id     - Get user\nPUT    /api/users/:id     - Update user\nDELETE /api/users/:id     - Delete user\n```',
        practice: 'Design REST endpoints for a blog application with posts, comments, and users.',
        resources: ['RESTful API Design', 'Swagger/OpenAPI'],
      },
      'css flexbox': {
        explanation: 'Flexbox is a one-dimensional layout method for arranging items in rows or columns.',
        steps: [
          'Container: `display: flex` enables flexbox.',
          'Direction: `flex-direction: row | column`.',
          'Justify: `justify-content` aligns along main axis (space-between, center, etc.).',
          'Align: `align-items` aligns along cross axis (center, stretch, etc.).',
          'Wrap: `flex-wrap: wrap` allows items to wrap to next line.',
          'Flex items: `flex-grow`, `flex-shrink`, `flex-basis` control sizing.',
        ],
        example: '```css\n.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1rem;\n}\n\n.item {\n  flex: 1; /* grow, shrink, basis */\n}\n```',
        practice: 'Recreate a navigation bar and a card grid layout using only Flexbox.',
        resources: ['CSS-Tricks: Flexbox', 'Flexbox Froggy'],
      },
      'css grid': {
        explanation: 'CSS Grid is a two-dimensional layout system for complex page layouts.',
        steps: [
          'Container: `display: grid`.',
          'Define columns: `grid-template-columns: 1fr 2fr 1fr`.',
          'Define rows: `grid-template-rows: auto 1fr auto`.',
          'Gap: `gap: 1rem` for spacing between items.',
          'Place items: `grid-column: 1 / 3`, `grid-row: 1 / 2`.',
          'Use `repeat()`, `minmax()`, and `auto-fit` for responsive grids.',
        ],
        example: '```css\n.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 1.5rem;\n}\n\n.header {\n  grid-column: 1 / -1; /* span all columns */\n}\n```',
        practice: 'Build a responsive photo gallery and a dashboard layout using CSS Grid.',
        resources: ['CSS-Tricks: Grid', 'Grid Garden'],
      },
    },
  },
  general: {
    keywords: ['error', 'debug', 'fix', 'help', 'explain', 'what is', 'how to', 'why', 'difference', 'best practice', 'pattern', 'design pattern', 'oop', 'functional', 'testing', 'git', 'deploy', 'docker', 'aws', 'ci/cd', 'interview', 'coding interview', 'leetcode', 'problem solving'],
    concepts: {
      'interview': {
        explanation: 'Coding interviews typically cover data structures, algorithms, system design, and behavioral questions.',
        steps: [
          '1. Clarify the problem - ask questions about constraints.',
          '2. Start with brute force - discuss time/space complexity.',
          '3. Optimize - think about better approaches.',
          '4. Code cleanly - write readable, bug-free code.',
          '5. Test - trace through examples, handle edge cases.',
          'Practice: Arrays, Strings, Trees, Graphs, Dynamic Programming.',
        ],
        example: 'Common patterns:\n- Two Pointers\n- Sliding Window\n- Binary Search\n- BFS/DFS\n- Dynamic Programming\n- Backtracking',
        practice: 'Solve 2-3 problems daily on LeetCode/HackerRank focusing on one pattern at a time.',
        resources: ['NeetCode.io', 'LeetCode Patterns', 'Cracking the Coding Interview'],
      },
      'debugging': {
        explanation: 'Debugging is the process of finding and fixing bugs in your code.',
        steps: [
          '1. Reproduce the bug consistently.',
          '2. Read the error message carefully.',
          '3. Add console.log/print statements to trace execution.',
          '4. Use a debugger (breakpoints, step through code).',
          '5. Check recent changes (git diff).',
          '6. Search for the error message - someone likely solved it.',
          '7. Fix the root cause, not just the symptom.',
        ],
        example: '```javascript\n// Instead of:\n// console.log(x);\n\n// Use descriptive logging:\nconsole.log("DEBUG: fetchUser response:", response);\nconsole.log("DEBUG: user object:", user);\n```',
        practice: 'Intentionally add bugs to a project and practice systematic debugging.',
        resources: ['How to Debug Like a Pro', 'Chrome DevTools Guide'],
      },
      'testing': {
        explanation: 'Testing ensures your code works correctly and catches regressions early.',
        steps: [
          'Unit tests: Test individual functions/components in isolation.',
          'Integration tests: Test how modules work together.',
          'E2E tests: Test complete user workflows.',
          'Use mocks/stubs for external dependencies.',
          'Write tests BEFORE fixing bugs (test-first) to prevent regressions.',
          'Aim for meaningful coverage, not 100% line coverage.',
        ],
        example: '```javascript\n// Jest example\ndescribe("add", () => {\n  it("adds two numbers", () => {\n    expect(add(2, 3)).toBe(5);\n  });\n  it("handles negatives", () => {\n    expect(add(-1, 1)).toBe(0);\n  });\n});\n```',
        practice: 'Write unit tests for a utility library you use or have built.',
        resources: ['Jest Documentation', 'Testing Library', 'Kent C. Dodds: Testing'],
      },
    },
  },
};

const GREETING_RESPONSES = [
  "Hello! I'm your AI Learning Assistant. I can help you with programming concepts, debugging, learning roadmaps, and more. What would you like to learn about?",
  "Hi there! Ready to learn something new? Ask me about any programming topic - JavaScript, React, Python, data structures, algorithms, or anything else!",
  "Welcome! I'm here to help you learn. Whether it's understanding a concept, fixing an error, or planning your study path - just ask!",
];

const ROADMAPS = {
  'frontend': {
    title: 'Frontend Development Roadmap',
    steps: [
      '1. HTML & CSS fundamentals (semantic HTML, Flexbox, Grid)',
      '2. JavaScript basics (variables, functions, DOM, events)',
      '3. Git & GitHub version control',
      '4. React or Vue.js framework',
      '5. State management (Redux, Context API)',
      '6. API integration (REST, GraphQL)',
      '7. TypeScript for type safety',
      '8. Testing (Jest, React Testing Library)',
      '9. Performance optimization',
      '10. Deployment (Vercel, Netlify, AWS)',
    ],
  },
  'backend': {
    title: 'Backend Development Roadmap',
    steps: [
      '1. Programming language (Node.js, Python, or Java)',
      '2. HTTP & REST API design',
      '3. Database (PostgreSQL, MongoDB)',
      '4. Authentication & authorization (JWT, OAuth)',
      '5. API security best practices',
      '6. Caching (Redis)',
      '7. Testing & documentation',
      '8. Docker containerization',
      '9. CI/CD pipelines',
      '10. Cloud deployment (AWS, GCP, Azure)',
    ],
  },
  'fullstack': {
    title: 'Full-Stack Development Roadmap',
    steps: [
      '1. HTML, CSS, JavaScript fundamentals',
      '2. React or Vue for frontend',
      '3. Node.js + Express for backend',
      '4. PostgreSQL or MongoDB database',
      '5. REST API design & integration',
      '6. Authentication (JWT)',
      '7. Git version control',
      '8. Docker basics',
      '9. Testing (unit + integration)',
      '10. Deployment & DevOps basics',
    ],
  },
  'data science': {
    title: 'Data Science Roadmap',
    steps: [
      '1. Python programming fundamentals',
      '2. NumPy & Pandas for data manipulation',
      '3. Data visualization (Matplotlib, Seaborn)',
      '4. Statistics & probability basics',
      '5. SQL for data querying',
      '6. Machine Learning fundamentals (Scikit-learn)',
      '7. Feature engineering',
      '8. Deep Learning basics (TensorFlow/PyTorch)',
      '9. Real-world projects & portfolio',
      '10. MLOps & deployment',
    ],
  },
  'mobile': {
    title: 'Mobile Development Roadmap',
    steps: [
      '1. Programming language (Dart for Flutter, Kotlin for Android, Swift for iOS)',
      '2. UI/UX fundamentals for mobile',
      '3. Cross-platform framework (Flutter or React Native)',
      '4. State management',
      '5. API integration',
      '6. Local storage & databases',
      '7. Push notifications',
      '8. App publishing (Play Store, App Store)',
      '9. Performance optimization',
      '10. CI/CD for mobile',
    ],
  },
  'devops': {
    title: 'DevOps Engineering Roadmap',
    steps: [
      '1. Linux fundamentals & command line',
      '2. Networking basics (DNS, HTTP, TCP/IP)',
      '3. Git version control',
      '4. Scripting (Bash, Python)',
      '5. CI/CD pipelines (GitHub Actions, Jenkins)',
      '6. Docker containerization',
      '7. Kubernetes orchestration',
      '8. Cloud platforms (AWS/GCP/Azure)',
      '9. Infrastructure as Code (Terraform)',
      '10. Monitoring & logging (Prometheus, Grafana)',
    ],
  },
  'dsa': {
    title: 'Data Structures & Algorithms Roadmap',
    steps: [
      '1. Arrays & Strings (two pointers, sliding window)',
      '2. Linked Lists (reversal, cycle detection)',
      '3. Stacks & Queues',
      '4. Hash Tables (frequency counting, two-sum pattern)',
      '5. Trees (BFS, DFS, BST operations)',
      '6. Graphs (BFS, DFS, shortest path)',
      '7. Sorting algorithms (merge, quick, heap)',
      '8. Binary search & variations',
      '9. Dynamic Programming (memoization, tabulation)',
      '10. Greedy algorithms & backtracking',
    ],
  },
};

function detectIntent(message) {
  const lower = message.toLowerCase().trim();

  if (/^(hi|hello|hey|greetings|sup|yo|howdy)\b/.test(lower)) {
    return 'greeting';
  }
  if (/roadmap|learning path|study plan|what should i learn|where to start|career path/.test(lower)) {
    return 'roadmap';
  }
  if (/error|bug|issue|problem|not working|broken|exception|undefined is not|cannot read|typeerror|referenceerror/.test(lower)) {
    return 'error_help';
  }
  if (/interview|coding interview|preparation|prep|leetcode|dsa|system design/.test(lower)) {
    return 'interview_prep';
  }
  if (/resource|recommend|book|course|tutorial|youtube|article|where to learn|best way to learn/.test(lower)) {
    return 'resources';
  }
  if (/still stuck|need more help|mentor|connect with|senior|human help|more help|didn't help|still confused|not clear/.test(lower)) {
    return 'mentor_suggestion';
  }
  if (/practice|exercise|challenge|problem|task|homework|assignment/.test(lower)) {
    return 'practice';
  }
  return 'concept';
}

function detectTopic(message) {
  const lower = message.toLowerCase();
  for (const [topic, data] of Object.entries(KNOWLEDGE_BASE)) {
    for (const keyword of data.keywords) {
      if (lower.includes(keyword)) {
        return topic;
      }
    }
  }
  return 'general';
}

function findBestConcept(message, topic) {
  const data = KNOWLEDGE_BASE[topic];
  if (!data) return null;
  const lower = message.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  for (const [conceptName, conceptData] of Object.entries(data.concepts)) {
    const conceptWords = conceptName.toLowerCase().split(/\s+/);
    let score = 0;
    for (const word of conceptWords) {
      if (lower.includes(word)) score += 2;
    }
    const allKeywords = data.keywords;
    for (const kw of allKeywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { name: conceptName, ...conceptData };
    }
  }
  return bestMatch;
}

let interactionCount = 0;

export function getAIResponse(message, conversationHistory = []) {
  interactionCount++;
  const intent = detectIntent(message);
  const topic = detectTopic(message);

  if (intent === 'greeting') {
    const idx = Math.floor(Math.random() * GREETING_RESPONSES.length);
    return {
      response: GREETING_RESPONSES[idx],
      suggestions: ['Explain closures in JavaScript', 'Show me a React roadmap', 'Help with debugging'],
      type: 'greeting',
    };
  }

  if (intent === 'roadmap') {
    let roadmapKey = null;
    if (/frontend|front-end|react|vue|angular|ui|css|html/.test(message.toLowerCase())) roadmapKey = 'frontend';
    else if (/backend|back-end|server|node|python|api/.test(message.toLowerCase())) roadmapKey = 'backend';
    else if (/full.?stack|fullstack/.test(message.toLowerCase())) roadmapKey = 'fullstack';
    else if (/data science|machine learning|ml|ai|analytics/.test(message.toLowerCase())) roadmapKey = 'data science';
    else if (/mobile|android|ios|flutter|react native|app/.test(message.toLowerCase())) roadmapKey = 'mobile';
    else if (/devops|docker|kubernetes|ci\/cd|cloud|aws/.test(message.toLowerCase())) roadmapKey = 'devops';
    else if (/dsa|data structure|algorithm|leetcode|competitive/.test(message.toLowerCase())) roadmapKey = 'dsa';
    else roadmapKey = 'fullstack';

    const roadmap = ROADMAPS[roadmapKey];
    const stepsList = roadmap.steps.map(s => `${s}`).join('\n');
    return {
      response: `**${roadmap.title}**\n\n${stepsList}\n\n**Tip:** Focus on one step at a time. Build small projects at each stage to reinforce your learning.`,
      suggestions: ['Tell me more about step 1', 'What resources should I use?', 'How long does this take?'],
      type: 'roadmap',
    };
  }

  if (intent === 'error_help') {
    return {
      response: `**Debugging Strategy**\n\nWhen you encounter an error, follow these steps:\n\n1. **Read the error message carefully** - it usually tells you the file and line number.\n2. **Check the stack trace** - trace the execution path.\n3. **Use console.log** - add logging before and after the problematic line.\n4. **Check common causes:**\n   - Undefined variables or typos\n   - Missing imports\n   - Incorrect data types\n   - Off-by-one errors in loops\n   - Async timing issues\n5. **Search the error message** - copy-paste it into Google/Stack Overflow.\n6. **Use a debugger** - set breakpoints and step through the code.\n\nCan you share the specific error message? I can help you analyze it.`,
      suggestions: ['Share the error message', 'Common React errors', 'Common Python errors'],
      type: 'error_help',
    };
  }

  if (intent === 'interview_prep') {
    return {
      response: `**Coding Interview Preparation Guide**\n\n**Study Plan (4-6 weeks):**\n- Week 1-2: Arrays, Strings, Hash Tables\n- Week 3: Trees, Graphs, BFS/DFS\n- Week 4: Dynamic Programming, Greedy\n- Week 5-6: System Design, Behavioral\n\n**Key Patterns to Master:**\n- Two Pointers\n- Sliding Window\n- Binary Search\n- BFS/DFS\n- Recursion & Backtracking\n- Dynamic Programming\n\n**Tips:**\n- Think out loud during interviews\n- Start with brute force, then optimize\n- Ask clarifying questions\n- Test your solution with examples\n- Discuss time/space complexity\n\n**Resources:** NeetCode.io, LeetCode, Blind 75, Cracking the Coding Interview`,
      suggestions: ['Explain two pointers pattern', 'Dynamic programming basics', 'System design tips'],
      type: 'interview_prep',
    };
  }

  if (intent === 'resources') {
    let resourceTopic = topic;
    if (topic === 'general') resourceTopic = detectTopic(message);
    const topicData = KNOWLEDGE_BASE[resourceTopic] || KNOWLEDGE_BASE.general;
    const concepts = Object.keys(topicData.concepts);
    const resourceList = concepts.map(c => topicData.concepts[c].resources).flat().slice(0, 6);
    return {
      response: `**Recommended Resources:**\n\n${resourceList.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n**General Learning Platforms:**\n- freeCodeCamp (free courses)\n- The Odin Project (full-stack)\n- CS50 (computer science fundamentals)\n- MDN Web Docs (web development reference)\n- JavaScript.info (comprehensive JS guide)`,
      suggestions: ['Explain a specific concept', 'Give me a roadmap', 'Help me practice'],
      type: 'resources',
    };
  }

  if (intent === 'practice') {
    return {
      response: `**Practice Recommendations:**\n\nBased on your topic, here are exercises to try:\n\n1. **Build a small project** - Apply what you've learned by building something real.\n2. **Solve coding problems** - Try LeetCode Easy/Medium problems related to this topic.\n3. **Write tests** - Test your understanding by writing test cases.\n4. **Teach someone else** - Explaining concepts reveals gaps in understanding.\n5. **Code review** - Look at others' code on GitHub for this topic.\n\n**Daily Practice Routine:**\n- 30 min: Read/learn new concept\n- 30 min: Code along with tutorial\n- 30 min: Solve practice problems\n- 30 min: Work on personal project`,
      suggestions: ['Suggest a project idea', 'Show me study resources', 'Explain a concept'],
      type: 'practice',
    };
  }

  if (intent === 'mentor_suggestion' || interactionCount >= 4) {
    interactionCount = 0;
    return {
      response: `**Still need help?** I've done my best to explain this concept, but sometimes a one-on-one conversation with an experienced mentor can make all the difference.\n\n**Connect with a senior mentor** who can:\n- Walk you through the concept step-by-step\n- Review your code and suggest improvements\n- Answer follow-up questions in real-time\n- Share industry best practices\n\nClick the **"Emergency Help"** button or visit the **Find Mentors** page to connect with someone who can help!`,
      suggestions: ['Find a mentor', 'Emergency help', 'Try asking the AI again'],
      type: 'mentor_suggestion',
    };
  }

  // Concept explanation (default)
  const concept = findBestConcept(message, topic);
  if (concept) {
    let response = `**${concept.name.charAt(0).toUpperCase() + concept.name.slice(1)}**\n\n${concept.explanation}\n\n**Step-by-Step:**\n${concept.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n**Example:**\n${concept.example}\n\n**Practice:**\n${concept.practice}`;
    if (concept.resources) {
      response += `\n\n**Resources:**\n${concept.resources.map(r => `- ${r}`).join('\n')}`;
    }
    return {
      response,
      suggestions: ['Explain another concept', 'Show me a roadmap', 'Help me practice this', 'Still need help?'],
      type: 'concept',
    };
  }

  // Fallback: general helpful response
  return {
    response: `I understand you're asking about "${message}". Here's what I can help with:\n\n**I can:**\n- Explain programming concepts step-by-step\n- Generate learning roadmaps for any tech path\n- Help debug code errors\n- Suggest study resources and practice exercises\n- Prepare you for coding interviews\n\n**Try asking about:**\n- JavaScript closures, async/await, promises\n- React hooks, components, state management\n- Python classes, decorators, comprehensions\n- Data structures (arrays, trees, graphs)\n- CSS Flexbox, Grid layout\n- REST API design\n- Interview preparation\n\nWhat specific topic would you like to explore?`,
    suggestions: ['JavaScript basics', 'React roadmap', 'Data structures', 'Interview prep'],
    type: 'fallback',
  };
}

export function analyzeEmergencyIssue(issue) {
  const lower = issue.toLowerCase();
  const topics = [];
  if (/react|component|hook|state|props/.test(lower)) topics.push('React');
  if (/javascript|js|promise|async|closure|dom/.test(lower)) topics.push('JavaScript');
  if (/python|django|flask|pip/.test(lower)) topics.push('Python');
  if (/css|flexbox|grid|layout|responsive/.test(lower)) topics.push('CSS');
  if (/html|tag|element|semantic/.test(lower)) topics.push('HTML');
  if (/sql|database|query|postgres|mongo/.test(lower)) topics.push('Database');
  if (/api|rest|endpoint|http|fetch/.test(lower)) topics.push('API');
  if (/git|commit|merge|branch|conflict/.test(lower)) topics.push('Git');
  if (/docker|container|deploy|ci\/cd/.test(lower)) topics.push('DevOps');
  if (/algorithm|data structure|tree|graph|sort/.test(lower)) topics.push('DSA');
  if (topics.length === 0) topics.push('General Programming');
  return topics;
}

export function getQuickResponse(message) {
  const intent = detectIntent(message);
  if (intent === 'greeting') return 'Hello! Ask me anything about programming!';
  if (intent === 'roadmap') return 'Generating a learning roadmap for you...';
  if (intent === 'error_help') return 'Let me help you debug that error.';
  return 'Let me think about that...';
}

export function explainCode(code, language) {
  const lines = code.split('\n');
  const analyzedLines = [];
  const optimizations = [];
  const concepts = [];
  let maxNesting = 0;
  let currentNesting = 0;
  let hasVar = false;
  let hasDoubleEquals = false;
  let hasConsoleLog = false;
  let hasErrorHandling = false;
  let hasBinarySearch = false;

  const lang = (language || '').toLowerCase();

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    let type = 'general';
    let explanation = '';

    // Detect function declarations
    if (/\b(function|def|func|fn|public\s+static\s+void|private\s+void|protected\s+void)\b/.test(trimmed) ||
        /^(export\s+)?(default\s+)?(async\s+)?function\s+\w+/.test(trimmed) ||
        /^(export\s+)?const\s+\w+\s*=\s*(async\s+)?\(/.test(trimmed) ||
        /^(export\s+)?const\s+\w+\s*=\s*(async\s+)?function/.test(trimmed)) {
      type = 'function';
      const funcName = trimmed.match(/(?:function|def|func|fn)\s+(\w+)/)?.[1] ||
                       trimmed.match(/(?:const|let|var)\s+(\w+)\s*=/)?.[1] || 'anonymous';
      explanation = `Function declaration: ${funcName}`;
    }
    // Detect variable declarations
    else if (/\b(let|const|var|int|float|double|char|String|bool|boolean|public|private|protected)\s+\w+\s*[=;:]/.test(trimmed) ||
             /^(import|from|require)\s/.test(trimmed)) {
      if (/^(import|from|require)\s/.test(trimmed)) {
        type = 'import';
        explanation = 'Module import statement';
      } else {
        type = 'variable';
        const varName = trimmed.match(/(?:let|const|var|int|float|double|char|String|bool|boolean)\s+(\w+)/)?.[1] || 'variable';
        explanation = `Variable declaration: ${varName}`;
        if (/\bvar\b/.test(trimmed)) hasVar = true;
      }
    }
    // Detect loops
    else if (/\b(for|while|do)\b/.test(trimmed) && /[{(]/.test(trimmed)) {
      type = 'loop';
      const loopType = trimmed.match(/\b(for|while|do)\b/)?.[1] || 'loop';
      explanation = `${loopType.charAt(0).toUpperCase() + loopType.slice(1)} loop`;
      currentNesting++;
      if (currentNesting > maxNesting) maxNesting = currentNesting;
    }
    // Detect conditionals
    else if (/\b(if|else|else\s+if|elif|switch|case|default)\b/.test(trimmed)) {
      type = 'condition';
      const condType = trimmed.match(/\b(if|else|elif|switch|case|default)\b/)?.[1] || 'condition';
      explanation = `${condType.charAt(0).toUpperCase() + condType.slice(1)} statement`;
    }
    // Detect return statements
    else if (/^return\b/.test(trimmed) || /^\s*return\b/.test(trimmed)) {
      type = 'return';
      explanation = 'Return statement';
    }
    // Detect console/print output
    else if (/\b(console\.\w+|print\(|System\.out\.print|fmt\.Print|puts\s|p\s)/.test(trimmed)) {
      type = 'output';
      explanation = 'Output/print statement';
      hasConsoleLog = true;
    }
    // Detect comments
    else if (/^\/\//.test(trimmed) || /^#/.test(trimmed) || /^\/\*/.test(trimmed) || /^\*/.test(trimmed) || /^\/\*\*/.test(trimmed)) {
      type = 'comment';
      explanation = 'Code comment';
    }
    // Detect class definitions
    else if (/\b(class|interface|struct|enum)\s+\w+/.test(trimmed)) {
      type = 'class';
      const className = trimmed.match(/\b(class|interface|struct|enum)\s+(\w+)/)?.[2] || 'class';
      explanation = `Class/interface definition: ${className}`;
    }
    // Detect try/catch
    else if (/\b(try|catch|finally|except|raise|throw|throw\s+new)\b/.test(trimmed)) {
      type = 'error-handling';
      const errorType = trimmed.match(/\b(try|catch|finally|except|raise|throw)\b/)?.[1] || 'error-handling';
      explanation = `${errorType.charAt(0).toUpperCase() + errorType.slice(1)} block`;
      hasErrorHandling = true;
    }
    // Detect array/object methods
    else if (/\.(map|filter|reduce|forEach|find|some|every|includes|indexOf|push|pop|shift|unshift|slice|splice|concat|join|sort|reverse|keys|values|entries)\s*\(/.test(trimmed)) {
      type = 'method';
      const method = trimmed.match(/\.(\w+)\s*\(/)?.[1] || 'method';
      explanation = `Array/object method call: ${method}`;
    }
    // Detect arrow functions
    else if (/=>\s*[{(]?/.test(trimmed) && /const|let|var|function|\(/.test(trimmed)) {
      type = 'function';
      explanation = 'Arrow function expression';
    }

    // Track nesting for closing braces
    if (trimmed === '}' || trimmed === '};' || trimmed === '});') {
      if (currentNesting > 0) currentNesting--;
    }

    // Check for binary search pattern
    if (/\bmid\s*=|Math\.floor|>>\s*1|\/\s*2\b/.test(trimmed) && /\b(left|right|low|high|start|end)\b/.test(trimmed)) {
      hasBinarySearch = true;
    }

    // Check for strict equality
    if (/[^!=]==[^=]/.test(trimmed)) {
      hasDoubleEquals = true;
    }

    // Detect concepts
    if (/=>\s*[{(]?/.test(trimmed) && !concepts.includes('Arrow Functions')) {
      concepts.push('Arrow Functions');
    }
    if (/\b(async|await)\b/.test(trimmed) && !concepts.includes('Async/Await')) {
      concepts.push('Async/Await');
    }
    if (/\{[^}]*\}\s*=/.test(trimmed) && !concepts.includes('Destructuring')) {
      concepts.push('Destructuring');
    }
    if (/\.(map|filter|reduce)\s*\(/.test(trimmed) && !concepts.includes('Functional Programming')) {
      concepts.push('Functional Programming');
    }
    if (/\bclass\s+\w+/.test(trimmed) && !concepts.includes('Object-Oriented Programming')) {
      concepts.push('Object-Oriented Programming');
    }
    if (/\bimport\s+.*from\s+/.test(trimmed) && !concepts.includes('Module System')) {
      concepts.push('Module System');
    }
    if (/\b(async|await|Promise|\.then)\b/.test(trimmed) && !concepts.includes('Asynchronous Programming')) {
      concepts.push('Asynchronous Programming');
    }
    if (/\b(const|let)\s*\{/.test(trimmed) && !concepts.includes('Destructuring')) {
      concepts.push('Destructuring');
    }
    if (/\.\.\.[\w]/.test(trimmed) && !concepts.includes('Spread/Rest Operators')) {
      concepts.push('Spread/Rest Operators');
    }
    if (/\bnew\s+Promise\b/.test(trimmed) && !concepts.includes('Promises')) {
      concepts.push('Promises');
    }
    if (/\btry\b/.test(trimmed) && !concepts.includes('Error Handling')) {
      concepts.push('Error Handling');
    }

    analyzedLines.push({
      lineNum: index + 1,
      code: line,
      explanation: explanation || 'General statement',
      type,
    });
  });

  // Calculate time complexity
  let timeComplexity = 'O(1)';
  if (maxNesting >= 3) {
    timeComplexity = 'O(n³)';
  } else if (maxNesting === 2) {
    timeComplexity = 'O(n²)';
  } else if (maxNesting === 1) {
    timeComplexity = 'O(n)';
  }
  if (hasBinarySearch && timeComplexity === 'O(n)') {
    timeComplexity = 'O(log n)';
  }

  // Estimate space complexity
  const variableCount = analyzedLines.filter(l => l.type === 'variable').length;
  const hasRecursion = /\bfunction\s+\w+.*\1\b/.test(code) || /\bdef\s+\w+.*\1\b/.test(code);
  let spaceComplexity = 'O(1)';
  if (hasRecursion) {
    spaceComplexity = 'O(n)';
  } else if (variableCount > 10) {
    spaceComplexity = 'O(n)';
  } else if (variableCount > 5) {
    spaceComplexity = 'O(1)';
  }

  // Generate optimizations
  if (maxNesting >= 2) {
    optimizations.push('Consider using a hash map to reduce time complexity');
  }
  if (hasVar) {
    optimizations.push('Use const/let instead of var for better scoping');
  }
  if (hasDoubleEquals) {
    optimizations.push('Use === for strict equality comparison');
  }
  if (!hasErrorHandling && code.includes('fetch') || code.includes('http') || code.includes('api')) {
    optimizations.push('Add try-catch for error handling');
  }
  if (hasConsoleLog) {
    optimizations.push('Remove console.log statements in production');
  }
  if (analyzedLines.some(l => l.type === 'loop' && analyzedLines.filter(l2 => l2.type === 'loop').length > 1)) {
    if (!optimizations.includes('Consider using a hash map to reduce time complexity')) {
      optimizations.push('Consider using a hash map to reduce time complexity');
    }
  }

  // Generate summary
  const functionCount = analyzedLines.filter(l => l.type === 'function').length;
  const loopCount = analyzedLines.filter(l => l.type === 'loop').length;
  const conditionCount = analyzedLines.filter(l => l.type === 'condition').length;
  const classCount = analyzedLines.filter(l => l.type === 'class').length;

  let summary = `This code contains ${lines.length} lines`;
  if (functionCount > 0) summary += ` with ${functionCount} function(s)`;
  if (loopCount > 0) summary += `, ${loopCount} loop(s)`;
  if (conditionCount > 0) summary += `, ${conditionCount} conditional(s)`;
  if (classCount > 0) summary += `, and ${classCount} class definition(s)`;
  summary += `. Estimated time complexity is ${timeComplexity} and space complexity is ${spaceComplexity}.`;
  if (concepts.length > 0) {
    summary += ` Key concepts used: ${concepts.join(', ')}.`;
  }
  if (optimizations.length > 0) {
    summary += ` Consider the following optimizations: ${optimizations[0]}.`;
  }

  return {
    lines: analyzedLines,
    timeComplexity,
    spaceComplexity,
    optimizations,
    concepts,
    summary,
  };
}
