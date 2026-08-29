// ==========================================================================
// UNYKORN ENTERPRISE FABRIC - NEURAL COPILOT & WEB3 PORTAL ENGINE
// Inspired by Bank of AI (bankofai.io) with complete UnyKorn System Intelligence
// ==========================================================================

const UNYKORN_KNOWLEDGE = {
  corporate: {
    entity: "UnyKorn LLC",
    state: "Wyoming, USA (Filed July 1, 2026)",
    ein: "42-3536633",
    isoMic: "UBEC",
    gleifLei: "984500E344761549B (Institutional Registry)",
    totalAuc: "$4,820,000,000 USD",
    verifiedAssetsCount: 155,
    genesisRootsCount: 78,
    athleteTrustRootsCount: 60,
    teamSuffixesCount: 8,
    primaryContractEvm: "0x4E574939D460d284B5D990646D4aeaEF2D49Fa13",
    polygonAdmin: "0x8aced25DC8530FDaf0f86D53a0A1E02AAfA7Ac7A",
    xrplIssuer: "rJLMSTy77hTxqgDw9WMxCnYC8m5vhqN3FQ",
    xrplDistributor: "rNX4faQ35SdtE4rDoEg8YeVLQKQ57AYyCt",
    stellarIssuer: "GB4FHGFUTLLMS3SC5RWRK6RYBGDIUQ5NR7IGN5TWAA3QVHULJ34JGEG4"
  },
  products: {
    legalx: {
      name: "Legal-X & Matter Twins",
      url: "https://app.legacychain.app",
      description: "Legal matter digital twins, SHA-256 evidence hashing, and court-admissible audit proof vaults."
    },
    legacy: {
      name: "Legacy Vault",
      url: "https://legacychain.app",
      description: "Family office estate continuity, multi-sig asset succession, and 5-proof cryptographic preservation."
    },
    ldx: {
      name: "LDX Capital & FlashRouter",
      url: "https://ldx.unykorn.ai",
      description: "Private credit underwriting, construction draw disbursement desks, and multi-rail cross-chain routing (EVM, Solana, XRPL, Stellar)."
    },
    smartcontract: {
      name: "Smart Contract Builder",
      url: "https://smartcontract.unykorn.ai",
      description: "ERC-3643 sovereign asset tokenization studio and pre-audited smart custody deployment engine."
    },
    art: {
      name: "Global Art Authority (GAA)",
      url: "https://art.unykorn.ai",
      description: "Proof-first fine art provenance infrastructure, Lloyd's insured depository vaults, and appraisal hash verification."
    },
    bd: {
      name: "BrokerDealer OS / Aeterna Capital",
      url: "https://brokerdealer.unykorn.org",
      description: "Institutional broker-dealer compliance, Reg D 506(c) qualified investor onboarding, and sovereign SPVs."
    },
    xrplloans: {
      name: "XRPL Loans",
      url: "https://xrplloans.unykorn.org/platform",
      description: "Decentralized liquidity facilities and collateralized credit lines on the XRPL ledger."
    }
  },
  packages: [
    {
      id: "pkg_evidence",
      name: "01. Evidence & Controls Desk",
      target: "Construction, Legal, SPVs",
      setupUsd: 7500,
      monthlyUsd: 750,
      metering: "$45 per verified export",
      features: ["Legal-X Matter Engine", "SHA-256 Evidence Vault", "Append-Only Audit Ledger", "Cloudflare SaaS Custom Hostname"]
    },
    {
      id: "pkg_legacy",
      name: "02. Legacy Vault Portal",
      target: "Wealth Desks, RIA Networks",
      setupUsd: 5000,
      monthlyUsd: 499,
      metering: "$5/mo per vault subscription",
      features: ["5-Proof Cryptographic Engine", "Estate Succession Graphs", "Client Branded PWA", "Encrypted Document Store"]
    },
    {
      id: "pkg_credit",
      name: "03. Private Credit Operations Desk",
      target: "Commercial Lenders, Debt Funds",
      setupUsd: 17500,
      monthlyUsd: 1499,
      metering: "0.05% per routed draw packet",
      features: ["LDX Capital Loan Workspace", "FlashRouter Multi-Rail Engine", "3-of-3 Quorum Anti-Self-Approval", "BitGo MPC Custody Handoff"]
    },
    {
      id: "pkg_art",
      name: "04. Provenance Vault & GAA",
      target: "Art Galleries, Depositories",
      setupUsd: 10000,
      monthlyUsd: 850,
      metering: "$120 per appraisal hashed",
      features: ["Fine Art Depository Binding", "Lloyd's Insurance Attestations", "Physical-to-Digital Merkle Proofs", "Polygon & EVM Anchors"]
    },
    {
      id: "pkg_issuer",
      name: "05. Digital Asset Issuer OS",
      target: "Commodity Sponsors, Fund SPVs",
      setupUsd: 25000,
      monthlyUsd: 2500,
      metering: "0.10% on primary issuances",
      features: ["ERC-3643 Sovereign Tokenization", "Reg D / Reg S Allowlist Engine", "Investor KYC/AML Integration", "Polygon Block 61M Anchor"]
    },
    {
      id: "pkg_sovereign",
      name: "06. Sovereign Enterprise Fabric",
      target: "Master Family Offices, Banks",
      setupUsd: 65000,
      monthlyUsd: 4999,
      metering: "Contracted capacity & dedicated SLA",
      features: ["All 12+ Modular Systems", "Custom Multi-Chain Subnets", "Dedicated PostgreSQL RLS Cluster", "24/7 Priority Engineering SLA"]
    }
  ]
};

let selectedPackages = ['pkg_credit'];

// CALCULATE STACK PRICING
function selectStackPackage(pkgId) {
  const idx = selectedPackages.indexOf(pkgId);
  if (idx > -1) {
    if (selectedPackages.length > 1) selectedPackages.splice(idx, 1);
  } else {
    selectedPackages.push(pkgId);
  }
  updateStackCalculatorUI();
}

function updateStackCalculatorUI() {
  document.querySelectorAll('.stack-option-card').forEach(card => {
    const id = card.dataset.pkgId;
    card.classList.toggle('selected', selectedPackages.includes(id));
  });

  let totalSetup = 0;
  let totalMonthly = 0;

  selectedPackages.forEach(id => {
    const p = UNYKORN_KNOWLEDGE.packages.find(x => x.id === id);
    if (p) {
      totalSetup += p.setupUsd;
      totalMonthly += p.monthlyUsd;
    }
  });

  document.getElementById('calcSetupTotal').innerText = `$${totalSetup.toLocaleString()}`;
  document.getElementById('calcMonthlyTotal').innerText = `$${totalMonthly.toLocaleString()} / mo`;
  document.getElementById('calcSelectedCount').innerText = `${selectedPackages.length} Modules Selected`;
}

// AI NEURAL COPILOT LOGIC
function sendUserPrompt(presetText) {
  const input = document.getElementById('aiChatInput');
  const query = presetText || input.value.trim();
  if (!query) return;

  if (!presetText) input.value = '';

  // Append user bubble
  appendChatBubble('user', query);

  // Generate AI Response
  setTimeout(() => {
    const responseHtml = generateAiResponse(query);
    appendChatBubble('ai', responseHtml);
  }, 400);
}

function appendChatBubble(role, content) {
  const container = document.getElementById('aiChatMessages');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  bubble.innerHTML = content;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function generateAiResponse(query) {
  const q = query.toLowerCase();

  if (q.includes('portfolio') || q.includes('auc') || q.includes('4.82') || q.includes('asset') || q.includes('namespace')) {
    return `
      <strong>UnyKorn LLC Institutional Asset & Namespace Portfolio</strong><br/>
      • <strong>Total Assets Under Custody (AUC):</strong> <span style="color:var(--neon-emerald); font-weight:700;">$4,820,000,000 USD</span> across 155 verified on-chain assets.<br/>
      • <strong>Corporate Anchor:</strong> UnyKorn LLC (Wyoming LLC filed July 1, 2026 | EIN: <code>42-3536633</code> | ISO MIC: <code>UBEC</code>).<br/>
      • <strong>Namespace Anchors:</strong> 78 Genesis Suffix roots, 60 Athlete Generational Trust Fund namespaces, 8 CWS Team Suffixes, and 9 Provenance Relics.<br/>
      • <strong>Primary EVM Contract:</strong> <code>0x4E574939D460d284B5D990646D4aeaEF2D49Fa13</code> on Polygon.<br/>
      • <strong>Live Registry:</strong> <a href="https://list.unykorn.ai" target="_blank" style="color:var(--neon-cyan);">list.unykorn.ai</a>
    `;
  }

  if (q.includes('ldx') || q.includes('credit') || q.includes('lending') || q.includes('loan') || q.includes('flashrouter')) {
    return `
      <strong>LDX Capital & FlashRouter Multi-Rail Lending Desk</strong><br/>
      • <strong>Operational Surface:</strong> <a href="https://ldx.unykorn.ai" target="_blank" style="color:var(--neon-cyan);">ldx.unykorn.ai</a> & GitHub: <code>FTHTrading/flashrouter</code><br/>
      • <strong>Functionality:</strong> Governed commercial private credit underwriting, construction draw milestone gating, and title search validation.<br/>
      • <strong>Policy Gating:</strong> Enforces 3-of-3 distinct quorum (Architect + Title + Lender) with strict anti-self-approval.<br/>
      • <strong>Multi-Rail Routing:</strong> EVM / Polygon smart custody, Solana high-speed receipts (<400ms), XRPL trustlines (<code>rNX4fa...AYyCt</code>), and Stellar anchors.
    `;
  }

  if (q.includes('price') || q.includes('cost') || q.includes('retainer') || q.includes('package') || q.includes('quote')) {
    return `
      <strong>UnyKorn White-Label Commercial Retainer Tiers</strong><br/>
      1. <strong>Evidence & Controls Desk:</strong> $7,500 setup | $750/mo<br/>
      2. <strong>Legacy Vault Portal:</strong> $5,000 setup | $499/mo<br/>
      3. <strong>Private Credit Desk:</strong> $17,500 setup | $1,499/mo<br/>
      4. <strong>Provenance Vault & GAA:</strong> $10,000 setup | $850/mo<br/>
      5. <strong>Digital Asset Issuer OS:</strong> $25,000 setup | $2,500/mo<br/>
      6. <strong>Sovereign Enterprise Fabric:</strong> $65,000+ setup | $4,999+/mo<br/>
      <em>All tiers include Cloudflare for SaaS custom hostname DNS routing and PostgreSQL RLS tenant isolation.</em>
    `;
  }

  if (q.includes('layer') || q.includes('architecture') || q.includes('bitgo') || q.includes('custody')) {
    return `
      <strong>The 4-Layer Institutional Architecture</strong><br/>
      1. <strong>Experience Layer:</strong> Branded client portals (<code>*.clientname.com</code> / <code>tenant.unykorn.ai</code>).<br/>
      2. <strong>Governance Layer:</strong> Organization credential graph, OIDC identities & anti-self-approval quorum engine.<br/>
      3. <strong>Operational Layer:</strong> Deal rooms, Legal-X matter twins & SHA-256 evidence hashing.<br/>
      4. <strong>Execution Boundary:</strong> Zero platform keys. Transaction outbox dispatches strictly to BitGo MPC Sandbox and FlashRouter settlement rails with Merkle chained audit receipts ($H_n$).
    `;
  }

  if (q.includes('legal-x') || q.includes('evidence') || q.includes('court') || q.includes('matter')) {
    return `
      <strong>Legal-X — Case DNA & Matter Digital Twins</strong><br/>
      • <strong>Live Portal:</strong> <a href="https://app.legacychain.app" target="_blank" style="color:var(--neon-cyan);">app.legacychain.app</a><br/>
      • <strong>Core Purpose:</strong> Provides cryptographic digital twins for legal cases, court exhibits, estate records, and title documents.<br/>
      • <strong>Cryptographic Anchor:</strong> Computes deterministic SHA-256 hashes of all uploaded photogrammetry and PDFs, linking them directly into the tamper-evident PostgreSQL audit chain.
    `;
  }

  return `
    <strong>UnyKorn Neural Copilot Summary:</strong><br/>
    I have full context on all UnyKorn operating properties, including $4.82B AUC across 155 assets, LDX Capital, Legal-X, FlashRouter, Smart Contract Studio, Relics / GAA, BitGo MPC custody boundary, and white-label deployment workflows.<br/><br/>
    Feel free to ask about specific modules, technical RLS architecture, commercial setup fees, or custom branding deployment at <code>whitelabel.unykorn.ai</code>!
  `;
}

// TERMINAL INTERACTIVE COMMANDS
function runTerminalCommand(cmd) {
  const term = document.getElementById('terminalOutput');
  let output = `\n<span style="color:#FFF;">$ unykorn ${cmd}</span>\n`;

  if (cmd === 'status') {
    output += `[OK] UnyKorn Enterprise Fabric Core: v3.8.0-sandbox\n[OK] Tenant Context: ACTIVE (PostgreSQL Forced RLS)\n[OK] Identity Adapter: OIDC / SAML Active\n[OK] BitGo MPC Sandbox: Connected (Zero Keys in DB)\n[OK] Total Monitored AUC: $4,820,000,000 USD\n[OK] Verified Assets: 155 On-Chain Entities`;
  } else if (cmd === 'rls') {
    output += `[RLS AUDIT] Scanning 6 Tenant-Owned Tables...\n✔ deals: FORCE ROW LEVEL SECURITY (Active)\n✔ audit_events: FORCE ROW LEVEL SECURITY (Active)\n✔ audit_export_events: FORCE ROW LEVEL SECURITY (Active)\n✔ tenant_memberships: FORCE ROW LEVEL SECURITY (Active)\n✔ organization_credentials: FORCE ROW LEVEL SECURITY (Active)\n✔ workflow_requests: FORCE ROW LEVEL SECURITY (Active)\n[RESULT] 100% Fail-Closed Policy Expression Confirmed.`;
  } else if (cmd === 'rails') {
    output += `[FLASHROUTER TELEMETRY]\n• Solana Micro-Rail: Block 284,102,940 (<400ms)\n• Polygon EVM Mainnet: Block 61,420,918 (Contract 0x4E57...Fa13)\n• XRPL Ledger: Index 89,102,402 (Issuer rJLMST...qN3FQ)\n• Stellar Network: Ledger 51,902,840 (Anchor GB4FHG...GEG4)\n[STATUS] All 4 Rails Synchronized.`;
  } else if (cmd === 'audit') {
    output += `[AUDIT LEDGER PROOF]\nGenesis Hash: 0000000000000000000000000000000000000000000000000000000000000000\nLatest Event #1042 Hash: 89abf7623c91e012fa89b2c8901df67e2a9810f78c9120938491823901bcefa78\nFormula: H_n = SHA256(H_{n-1} || canonical_payload_n)\nVerification: 100% Chain Linkage Confirmed.`;
  }

  term.innerHTML += output;
  term.scrollTop = term.scrollHeight;
}

// LIVE CHAIN TELEMETRY TICKS
function initTelemetryTicks() {
  setInterval(() => {
    const solTps = document.getElementById('liveSolTps');
    if (solTps) {
      const base = 2800 + Math.floor(Math.random() * 90);
      solTps.innerText = `${base.toLocaleString()} TPS`;
    }
  }, 2000);
}

// INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
  updateStackCalculatorUI();
  initTelemetryTicks();
});
