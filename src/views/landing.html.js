function renderApiLandingHtml(meta) {
    const jsonString = JSON.stringify(meta, null, 2);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lexidata API — Open Lexical Data & Dictionary REST API</title>
  <meta name="description" content="Open lexical data and REST API for English words, definitions, senses, pronunciations, and datasets powered by Open English WordNet.">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='70 80 400 360'%3E%3Cdefs%3E%3Cstyle%3E.s0%7Bfill:%233bb2f6%7D.s2%7Bfill:%2393c5fd%7D.s3%7Bfill:%23e5e7eb%7D%3C/style%3E%3C/defs%3E%3Cg%3E%3Cpath class='s2' d='M138.74,205.53v127.56s84.17-.65,123.02,58.92c0,0-11.65-53.74-67.34-71.22,0,0-9.71-12.95,5.83-18.13,0,0,16.24-4.83-14.84-61.59,0,0-25.14-31.83-46.67-35.53Z'/%3E%3Cpath class='s2' d='M279.53,392.98s18.13-53.92,65.07-71.72l1.94-57.95s14.89-46.27,56.66-56.8v126.41s-62.81-7.34-123.67,60.07Z'/%3E%3Cpath class='s0' d='M97.69,239.35l27.84,6.47v98.42s112.99,4.53,143.74,84.82c0,0-70.9-55.36-171.58-59.25v-130.47Z'/%3E%3Cpath class='s0' d='M444.31,239.35l-27.84,6.47v98.42s-112.99,4.53-143.74,84.82c0,0,70.9-55.36,171.58-59.25v-130.47Z'/%3E%3Cpath class='s3' d='M197.51,112.93h87.14v4.69s-19.1,5.99-19.42,18.78c-.32,12.79,0,158.8,0,158.8,0,0,25.09,22.01,63.62-38.04,0,0,5.83-3.4,5.83,0v58.27h-134.42v-5.67s12.85.49,17.22-16.19v-155.24s-5.94-18.94-19.96-18.94v-6.47Z'/%3E%3Cpath class='s0' d='M348.91,115.36s-6.76,44.35-40.47,44.35c0,0,40.47,6.51,40.47,41.12s0-85.47,0-85.47Z'/%3E%3Cpath class='s0' d='M348.91,115.36s6.76,44.35,40.47,44.35c0,0-40.47,6.51-40.47,41.12,0,34.61,0-85.47,0-85.47Z'/%3E%3C/g%3E%3C/svg%3E">
  <style>
    :root {
      --bg-deep: #080d1a;
      --bg-base: #0f172a;
      --bg-raised: #131f37;
      --bg-surface: rgba(255, 255, 255, 0.04);
      --bg-glass: rgba(255, 255, 255, 0.06);
      --accent: #38bdf8;
      --accent-soft: #93c5fd;
      --accent-glow: rgba(56, 189, 248, 0.14);
      --accent-dim: rgba(56, 189, 248, 0.08);
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --text-faint: #475569;
      --border: rgba(148, 163, 184, 0.14);
      --border-hover: rgba(148, 163, 184, 0.28);
      --border-focus: rgba(56, 189, 248, 0.5);
      --green: #34d399;
      --green-dim: rgba(52, 211, 153, 0.12);
      --serif: Georgia, "Times New Roman", Times, serif;
      --sans: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --mono: "SF Mono", "Fira Code", "JetBrains Mono", Menlo, Consolas, monospace;
      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 20px;
      --radius-pill: 999px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg-deep);
      color: var(--text-primary);
      font-family: var(--sans);
      font-size: 15px;
      line-height: 1.6;
      min-height: 100vh;
      background-image:
        radial-gradient(ellipse 70% 50% at 75% 5%, rgba(56, 189, 248, 0.08), transparent),
        radial-gradient(ellipse 60% 40% at 15% 95%, rgba(147, 197, 253, 0.04), transparent);
    }
    a { color: inherit; text-decoration: none; }
    button, input, select { font: inherit; }
    button { cursor: pointer; }
    ::selection { background: var(--accent); color: var(--bg-deep); }
    .container {
      width: min(1120px, calc(100% - 40px));
      margin: 0 auto;
    }
    /* Header */
    header {
      position: sticky;
      top: 0;
      z-index: 50;
      border-bottom: 1px solid var(--border);
      background: rgba(8, 13, 26, 0.85);
      backdrop-filter: blur(20px);
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      width: 32px;
      height: 32px;
      display: block;
    }
    .brand-name {
      font-family: var(--serif);
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .brand-badge {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--accent);
      background: var(--accent-dim);
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: var(--radius-pill);
      padding: 3px 8px;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .nav-link {
      padding: 7px 12px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .nav-link:hover {
      color: var(--text-primary);
      background: var(--bg-surface);
    }
    .nav-link.primary {
      background: var(--accent);
      color: var(--bg-deep);
      font-weight: 700;
    }
    .nav-link.primary:hover {
      opacity: 0.9;
    }
    /* Hero */
    .hero {
      padding: 72px 0 48px;
      text-align: center;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: var(--radius-pill);
      background: var(--green-dim);
      border: 1px solid rgba(52, 211, 153, 0.3);
      color: var(--green);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      margin-bottom: 24px;
    }
    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 10px var(--green);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }
    .hero-title {
      font-family: var(--serif);
      font-size: clamp(36px, 5vw, 60px);
      font-weight: 700;
      line-height: 1.08;
      letter-spacing: -0.04em;
      max-width: 820px;
      margin: 0 auto 18px;
    }
    .hero-title span { color: var(--accent); }
    .hero-subtitle {
      color: var(--text-secondary);
      font-size: 16px;
      max-width: 620px;
      margin: 0 auto 32px;
      line-height: 1.7;
    }
    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 22px;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 700;
      transition: all 0.2s;
    }
    .btn-primary {
      background: var(--accent);
      color: var(--bg-deep);
    }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-secondary {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--text-primary);
    }
    .btn-secondary:hover { border-color: var(--border-hover); background: var(--bg-glass); }
    /* Interactive Tester */
    .tester-section {
      padding: 24px 0 60px;
    }
    .tester-card {
      border: 1px solid rgba(56, 189, 248, 0.25);
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(16px);
      border-radius: var(--radius-lg);
      padding: 28px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
    }
    .tester-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .tester-title {
      font-family: var(--serif);
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tester-title .indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 8px var(--accent);
    }
    .preset-chips {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .preset-chip {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      color: var(--text-secondary);
      font-size: 11px;
      font-family: var(--mono);
      padding: 4px 10px;
      transition: all 0.2s;
    }
    .preset-chip:hover, .preset-chip.active {
      background: var(--accent-dim);
      border-color: rgba(56, 189, 248, 0.4);
      color: var(--accent-soft);
    }
    .url-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .method-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--mono);
      font-size: 12px;
      font-weight: 800;
      color: var(--accent);
      background: var(--accent-dim);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: var(--radius-sm);
      padding: 0 16px;
    }
    .url-input {
      flex: 1;
      background: #030712;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-family: var(--mono);
      font-size: 13px;
      padding: 12px 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .url-input:focus { border-color: var(--border-focus); }
    .send-btn {
      background: var(--accent);
      color: var(--bg-deep);
      border: none;
      border-radius: var(--radius-sm);
      padding: 0 20px;
      font-weight: 700;
      font-size: 13px;
      transition: all 0.2s;
    }
    .send-btn:hover { opacity: 0.9; }
    .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    /* Response Display */
    .response-box {
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: #020617;
      overflow: hidden;
    }
    .response-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      border-bottom: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.02);
      font-size: 11px;
    }
    .response-status {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-tag {
      font-family: var(--mono);
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
    }
    .status-tag.ok {
      color: var(--green);
      background: var(--green-dim);
      border: 1px solid rgba(52, 211, 153, 0.3);
    }
    .status-tag.err {
      color: #f87171;
      background: rgba(248, 113, 113, 0.12);
      border: 1px solid rgba(248, 113, 113, 0.3);
    }
    .response-time {
      color: var(--text-muted);
      font-family: var(--mono);
    }
    .copy-btn {
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      font-size: 10px;
      font-weight: 600;
      padding: 3px 10px;
      transition: all 0.2s;
    }
    .copy-btn:hover { color: var(--text-secondary); border-color: var(--border-hover); }
    .response-body {
      padding: 16px 20px;
      max-height: 380px;
      overflow-y: auto;
      font-family: var(--mono);
      font-size: 12px;
      line-height: 1.6;
      color: #cbd5e1;
      white-space: pre-wrap;
      word-break: break-word;
    }
    /* Endpoints Grid */
    .section-heading {
      font-family: var(--serif);
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin-bottom: 20px;
    }
    .endpoints-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
      margin-bottom: 60px;
    }
    .endpoint-card {
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      padding: 20px;
      transition: all 0.2s;
    }
    .endpoint-card:hover {
      border-color: var(--border-hover);
      background: var(--bg-glass);
      transform: translateY(-2px);
    }
    .endpoint-top {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .badge-get {
      font-family: var(--mono);
      font-size: 10px;
      font-weight: 800;
      color: var(--accent);
      background: var(--accent-dim);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: var(--radius-sm);
      padding: 2px 7px;
    }
    .endpoint-path {
      font-family: var(--mono);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .endpoint-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 14px;
    }
    .endpoint-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-family: var(--mono);
      color: var(--accent-soft);
      transition: color 0.2s;
    }
    .endpoint-link:hover { color: var(--accent); }
    /* Code Quickstart */
    .quickstart-card {
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: #060a15;
      overflow: hidden;
      margin-bottom: 60px;
    }
    .quickstart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      border-bottom: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.02);
    }
    .tabs {
      display: flex;
    }
    .tab-btn {
      padding: 12px 18px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .tab-btn:hover { color: var(--text-secondary); }
    .tab-btn.active {
      color: var(--accent-soft);
      border-bottom-color: var(--accent);
    }
    .code-pane {
      padding: 22px 24px;
      font-family: var(--mono);
      font-size: 12px;
      line-height: 1.8;
      color: #93c5fd;
      overflow-x: auto;
      white-space: pre;
    }
    /* Footer */
    footer {
      border-top: 1px solid var(--border);
      padding: 40px 0;
      font-size: 12px;
      color: var(--text-muted);
    }
    .footer-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    .footer-links {
      display: flex;
      gap: 16px;
    }
    .footer-links a:hover { color: var(--text-primary); }
    @media (max-width: 640px) {
      .hero-title { font-size: 32px; }
      .hero-actions { flex-direction: column; }
      .btn { width: 100%; justify-content: center; }
      .url-bar { flex-direction: column; }
      .method-badge { padding: 8px 0; }
      .endpoints-grid { grid-template-columns: 1fr; }
      .footer-inner { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>

  <header>
    <div class="container header-inner">
      <div class="brand">
        <svg class="brand-logo" xmlns="http://www.w3.org/2000/svg" viewBox="70 80 400 360" role="img" aria-label="Lexidata logo">
          <defs><style>.s0{fill:#3bb2f6}.s2{fill:#93c5fd}.s3{fill:#e5e7eb}</style></defs>
          <g>
            <path class="s2" d="M138.74,205.53v127.56s84.17-.65,123.02,58.92c0,0-11.65-53.74-67.34-71.22,0,0-9.71-12.95,5.83-18.13,0,0,16.24-4.83-14.84-61.59,0,0-25.14-31.83-46.67-35.53Z"/>
            <path class="s2" d="M279.53,392.98s18.13-53.92,65.07-71.72l1.94-57.95s14.89-46.27,56.66-56.8v126.41s-62.81-7.34-123.67,60.07Z"/>
            <path class="s0" d="M97.69,239.35l27.84,6.47v98.42s112.99,4.53,143.74,84.82c0,0-70.9-55.36-171.58-59.25v-130.47Z"/>
            <path class="s0" d="M444.31,239.35l-27.84,6.47v98.42s-112.99,4.53-143.74,84.82c0,0,70.9-55.36,171.58-59.25v-130.47Z"/>
            <path class="s3" d="M197.51,112.93h87.14v4.69s-19.1,5.99-19.42,18.78c-.32,12.79,0,158.8,0,158.8,0,0,25.09,22.01,63.62-38.04,0,0,5.83-3.4,5.83,0v58.27h-134.42v-5.67s12.85.49,17.22-16.19v-155.24s-5.94-18.94-19.96-18.94v-6.47Z"/>
            <path class="s0" d="M348.91,115.36s-6.76,44.35-40.47,44.35c0,0,40.47,6.51,40.47,41.12s0-85.47,0-85.47Z"/>
            <path class="s0" d="M348.91,115.36s6.76,44.35,40.47,44.35c0,0-40.47,6.51-40.47,41.12,0,34.61,0-85.47,0-85.47Z"/>
          </g>
        </svg>
        <span class="brand-name">Lexidata</span>
        <span class="brand-badge">REST API</span>
      </div>
      <nav class="nav-links">
        <a href="https://lexidata.dev/docs" class="nav-link">Docs</a>
        <a href="https://lexidata.dev" class="nav-link">Web Platform</a>
        <a href="https://lexidata.dev/export" class="nav-link">Export Studio</a>
        <a href="/api/v1?format=json" class="nav-link">JSON Spec</a>
        <a href="https://github.com/FahadNiz/lexidata" target="_blank" rel="noopener" class="nav-link">GitHub</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <section class="hero">
      <div class="status-pill">
        <span class="pulse-dot"></span>
        API Operational • v${meta.version || "1.0.0"}
      </div>
      <h1 class="hero-title">Open English Lexical Data &amp; <span>Dictionary REST API</span></h1>
      <p class="hero-subtitle">Fast, developer-first REST API serving 150,000+ English words, definitions, pronunciations, semantic senses, and dataset exports based on Open English WordNet.</p>
      <div class="hero-actions">
        <a href="https://lexidata.dev/docs" class="btn btn-primary">Browse Interactive Docs &rarr;</a>
        <a href="https://lexidata.dev" class="btn btn-secondary">Explore Lexidata Web</a>
        <a href="/api/v1?format=json" class="btn btn-secondary">Raw JSON Index</a>
      </div>
    </section>

    <!-- Interactive Tester -->
    <section class="tester-section">
      <div class="tester-card">
        <div class="tester-header">
          <div class="tester-title">
            <span class="indicator"></span>
            Live API Sandbox
          </div>
          <div class="preset-chips">
            <button class="preset-chip active" onclick="setEndpoint('/api/v1/words/lexicon')">Word: lexicon</button>
            <button class="preset-chip" onclick="setEndpoint('/api/v1/words/serendipity')">Word: serendipity</button>
            <button class="preset-chip" onclick="setEndpoint('/api/v1/search?q=comput&limit=10')">Search: comput</button>
            <button class="preset-chip" onclick="setEndpoint('/api/v1/random?limit=5')">Random: 5</button>
            <button class="preset-chip" onclick="setEndpoint('/health')">Health Check</button>
          </div>
        </div>

        <div class="url-bar">
          <span class="method-badge">GET</span>
          <input id="url-input" type="text" class="url-input" value="/api/v1/words/lexicon" placeholder="/api/v1/words/word">
          <button id="send-btn" class="send-btn" onclick="executeRequest()">Send Request</button>
        </div>

        <div class="response-box">
          <div class="response-header">
            <div class="response-status">
              <span id="status-tag" class="status-tag ok">200 OK</span>
              <span id="response-time" class="response-time">~12ms</span>
            </div>
            <button class="copy-btn" onclick="copyResponse()">Copy JSON</button>
          </div>
          <pre id="response-body" class="response-body">${jsonString}</pre>
        </div>
      </div>
    </section>

    <!-- Quickstart Code -->
    <section>
      <h2 class="section-heading">Quick Integration</h2>
      <div class="quickstart-card">
        <div class="quickstart-header">
          <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('curl')">cURL</button>
            <button class="tab-btn" onclick="switchTab('js')">JavaScript / SDK</button>
            <button class="tab-btn" onclick="switchTab('py')">Python</button>
          </div>
          <button class="copy-btn" onclick="copySnippet()">Copy Snippet</button>
        </div>
        <pre id="code-pane" class="code-pane">curl -s https://api.lexidata.dev/api/v1/words/lexicon</pre>
      </div>
    </section>

    <!-- Endpoints -->
    <section>
      <h2 class="section-heading">API Endpoints Overview</h2>
      <div class="endpoints-grid">
        <div class="endpoint-card">
          <div class="endpoint-top">
            <span class="badge-get">GET</span>
            <span class="endpoint-path">/api/v1/words/:word</span>
          </div>
          <p class="endpoint-desc">Look up full lexical entry for a word including definitions, pronunciations, parts of speech, and synset relations.</p>
          <a href="javascript:void(0)" onclick="setEndpoint('/api/v1/words/lexicon'); executeRequest();" class="endpoint-link">Try /api/v1/words/lexicon &rarr;</a>
        </div>

        <div class="endpoint-card">
          <div class="endpoint-top">
            <span class="badge-get">GET</span>
            <span class="endpoint-path">/api/v1/search?q=:query</span>
          </div>
          <p class="endpoint-desc">Search words with prefix, suffix, regex, or exact match with pagination and POS filtering.</p>
          <a href="javascript:void(0)" onclick="setEndpoint('/api/v1/search?q=comput&limit=10'); executeRequest();" class="endpoint-link">Try /api/v1/search?q=comput &rarr;</a>
        </div>

        <div class="endpoint-card">
          <div class="endpoint-top">
            <span class="badge-get">GET</span>
            <span class="endpoint-path">/api/v1/random?limit=:count</span>
          </div>
          <p class="endpoint-desc">Retrieve random words with optional part of speech and length filters.</p>
          <a href="javascript:void(0)" onclick="setEndpoint('/api/v1/random?limit=5'); executeRequest();" class="endpoint-link">Try /api/v1/random?limit=5 &rarr;</a>
        </div>

        <div class="endpoint-card">
          <div class="endpoint-top">
            <span class="badge-get">GET</span>
            <span class="endpoint-path">/api/v1/dataset</span>
          </div>
          <p class="endpoint-desc">Stream or export lexical datasets in JSON, JSONL, CSV, and TXT formats with custom field projections.</p>
          <a href="javascript:void(0)" onclick="setEndpoint('/api/v1/dataset?format=json&limit=5'); executeRequest();" class="endpoint-link">Try /api/v1/dataset?format=json &rarr;</a>
        </div>

        <div class="endpoint-card">
          <div class="endpoint-top">
            <span class="badge-get">GET</span>
            <span class="endpoint-path">/health</span>
          </div>
          <p class="endpoint-desc">API service health check and uptime monitor.</p>
          <a href="javascript:void(0)" onclick="setEndpoint('/health'); executeRequest();" class="endpoint-link">Try /health &rarr;</a>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container footer-inner">
      <div>
        Powered by Open English WordNet &amp; PostgreSQL. Open-source under MIT License.
      </div>
      <div class="footer-links">
        <a href="https://lexidata.dev">Web Platform</a>
        <a href="https://lexidata.dev/docs">Documentation</a>
        <a href="https://www.npmjs.com/package/lexidata" target="_blank" rel="noopener">npm SDK</a>
        <a href="https://github.com/FahadNiz/lexidata" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>
  </footer>

  <script>
    const snippets = {
      curl: 'curl -s https://api.lexidata.dev/api/v1/words/lexicon',
      js: '// npm install lexidata\\nconst { LexidataClient } = require("lexidata");\\nconst client = new LexidataClient();\\n\\nasync function run() {\\n  const word = await client.words.get("lexicon");\\n  console.log(word);\\n}\\nrun();',
      py: 'import requests\\n\\nresponse = requests.get("https://api.lexidata.dev/api/v1/words/lexicon")\\ndata = response.json()\\nprint(data)'
    };
    let currentTab = 'curl';

    function switchTab(tab) {
      currentTab = tab;
      document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', (tab === 'curl' && idx === 0) || (tab === 'js' && idx === 1) || (tab === 'py' && idx === 2));
      });
      document.getElementById('code-pane').textContent = snippets[tab];
    }

    function setEndpoint(path) {
      document.getElementById('url-input').value = path;
      document.querySelectorAll('.preset-chip').forEach(c => {
        c.classList.toggle('active', c.getAttribute('onclick').includes(path));
      });
    }

    async function executeRequest() {
      const urlInput = document.getElementById('url-input');
      const sendBtn = document.getElementById('send-btn');
      const statusTag = document.getElementById('status-tag');
      const timeTag = document.getElementById('response-time');
      const responseBody = document.getElementById('response-body');

      let path = urlInput.value.trim();
      if (!path.startsWith('/')) path = '/' + path;

      sendBtn.disabled = true;
      sendBtn.textContent = 'Fetching...';

      const startTime = performance.now();
      try {
        const res = await fetch(path);
        const duration = Math.round(performance.now() - startTime);
        const data = await res.json();

        statusTag.textContent = res.status + ' ' + (res.ok ? 'OK' : 'Error');
        statusTag.className = 'status-tag ' + (res.ok ? 'ok' : 'err');
        timeTag.textContent = duration + 'ms';
        responseBody.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        statusTag.textContent = 'Network Error';
        statusTag.className = 'status-tag err';
        timeTag.textContent = '-';
        responseBody.textContent = JSON.stringify({ error: err.message }, null, 2);
      } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send Request';
      }
    }

    function copyResponse() {
      const text = document.getElementById('response-body').textContent;
      navigator.clipboard.writeText(text);
      alert('Response JSON copied to clipboard!');
    }

    function copySnippet() {
      const text = snippets[currentTab];
      navigator.clipboard.writeText(text);
      alert('Code snippet copied to clipboard!');
    }
  </script>
</body>
</html>`;
}

module.exports = {
    renderApiLandingHtml
};
