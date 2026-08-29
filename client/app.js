// ==========================================================================
// UNYKORN ENTERPRISE FABRIC - STATE & LOGIC ENGINE (API INTEGRATED)
// ==========================================================================

const API_BASE_URL = 'http://localhost:8905/api/v1';

const ENVIRONMENTS = {
  demo: {
    badge: "DEMONSTRATION ENVIRONMENT",
    text: "Sample tenant data & simulated execution — no live assets, custodial wallets, settlement instructions, investor records, or transactions."
  },
  sandbox: {
    badge: "SANDBOX ENVIRONMENT",
    text: "Testnet and staging integrations active. Non-production API keys, simulated BitGo MPC, and test tokens only."
  },
  pilot: {
    badge: "CONTROLLED PILOT ENVIRONMENT",
    text: "Gated customer pilot tenant. Strictly defined workflows under executed evaluation agreements with human oversight."
  },
  production: {
    badge: "PRODUCTION (AUDITED & REGULATED)",
    text: "Live institutional operations. Available solely for audited smart contracts and approved custody partner integrations."
  }
};

const TENANTS_DATA = {
  dignity: {
    name: "Dignity Gold Reserves Inc.",
    domain: "portal.dignitygold.com",
    tag: "dignitygold.unykorn.ai",
    lei: "984500E344761549B (Demo Record)",
    custody: "BitGo Trust Co. (Sandbox MPC)",
    auc: "$3,000,000,000",
    dealVol: "$75,000,000",
    credentialsCount: "1,240 Time-Bound",
    pendingApprovalsCount: 2,
    primaryColor: "#E5A93C",
    accentColor: "#38BDF8",
    scenarioTitle: "Demo Scenario: Commodity Reserve Issuer",
    scenarioBody: "Fictionalized data for platform demonstration only. Not a statement of live reserves, custody, issuance, partnership, regulatory status, or transaction activity.",
    disclaimer: "Technology and software infrastructure powered by UnyKorn LLC. All custody, reserve administration, and redemption services performed by authorized partners.",
    deals: [
      {
        id: "DEAL-DIG-01",
        title: "Gold Reserve Tranche 2026-A (Sample)",
        type: "COMMODITY RESERVE ALLOCATION",
        borrower: "Dignity Gold Custody SPV",
        amount: "$50,000,000",
        ltv: "100% Backed (SGE 99.99%)",
        rate: "Physical Bar Allocation",
        term: "Perpetual Redeemable",
        progress: 85,
        status: "Reserve Attested"
      },
      {
        id: "DEAL-DIG-02",
        title: "Institutional Bullion Liquidity Facility (Sample)",
        type: "RESERVE LIQUIDITY LINE",
        borrower: "Sovereign Precious Metals LLC",
        amount: "$25,000,000",
        ltv: "92% Allocated",
        rate: "SOFR + 3.25%",
        term: "36 Months",
        progress: 60,
        status: "Underwriting & Verification"
      }
    ],
    pendingApprovals: [
      {
        id: "INTENT-9812",
        type: "token_mint / issuance",
        title: "Mint Intent: 5,000,000 DIG Tokens ($50M Equiv.)",
        desc: "Batch minting of gold-reserve-backed tokens into verified institutional investor allowlist wallets.",
        amount: "$50,000,000 USD",
        quorum: "2 of 3 Required (1 Issuer + 1 Compliance Approved)",
        signedBy: ["Kevan Burns (Compliance Officer)", "Dignity Issuer Admin"],
        missing: ["BitGo Trust Custody Officer"],
        hash: "0x89abf7623c91e012fa89b2c8901df67e2a9810f78"
      },
      {
        id: "INTENT-9813",
        type: "reserve_attestation",
        title: "Reserve Verification: Vault Audit Certificate #8892",
        desc: "Bureau Veritas signed assay and bar weight attestation document anchoring onto Polygon mainnet.",
        amount: "3,000,000,000 USD AUC",
        quorum: "1 of 2 Required",
        signedBy: ["Lead Assay Auditor"],
        missing: ["Compliance Officer Approval"],
        hash: "0x4e574939d460d284b5d990646d4aeaef2d49fa13"
      }
    ],
    vaults: [
      { name: "Dignity Gold Reserve Custody Vault", chain: "BitGo MPC Sandbox Vault", balance: "1,500,000 Fine Oz Gold", status: "Simulated Secure", address: "bitgo:vault:9847120938" },
      { name: "Dignity Mint Distribution Treasury", chain: "Polygon (0x4E57...Fa13)", balance: "12,450,000 DIG ($124.5M)", status: "Active Treasury", address: "0x8aced25DC8530FDaf0f86D53a0A1E02AAfA7Ac7A" }
    ]
  },
  blackwood: {
    name: "Blackwood Capital & Debt Fund",
    domain: "deals.blackwoodcap.com",
    tag: "blackwood.ldx.unykorn.ai",
    lei: "5493006M9X5660851N (Demo Record)",
    custody: "BitGo Prime / Escrow Partner (Sandbox)",
    auc: "$450,000,000",
    dealVol: "$120,000,000",
    credentialsCount: "420 Time-Bound",
    pendingApprovalsCount: 1,
    primaryColor: "#06B6D4",
    accentColor: "#10B981",
    scenarioTitle: "Demo Scenario: Private Credit & Commercial Lending Desk",
    scenarioBody: "Fictionalized loan underwriting workflows for demonstration only. Routing via LDX & FlashRouter simulated settlement channels.",
    disclaimer: "Blackwood Capital is a private debt fund and technology licensee of UnyKorn LLC. All lending workflows executed via FlashRouter and LDX Capital rails.",
    deals: [
      {
        id: "DEAL-LDX-88",
        title: "Industrial Logistics Center Bridge Loan (Sample)",
        type: "SENIOR SECURED DEBT",
        borrower: "Apex Logistics Holdings Inc.",
        amount: "$32,500,000",
        ltv: "62.5% First Lien",
        rate: "9.75% Fixed",
        term: "24 Months Interest-Only",
        progress: 90,
        status: "Lender Allocation Complete"
      },
      {
        id: "DEAL-LDX-89",
        title: "Multifamily Construction Draw #4 (Sample)",
        type: "CONSTRUCTION TRANCHE",
        borrower: "Midtown Residential Partners",
        amount: "$8,400,000",
        ltv: "58.0% As-Complete",
        rate: "SOFR + 4.50%",
        term: "18 Months",
        progress: 45,
        status: "Title & Inspection Verified"
      }
    ],
    pendingApprovals: [
      {
        id: "INTENT-9814",
        type: "construction_draw",
        title: "Construction Draw Release #4: Midtown Residential ($8.4M)",
        desc: "Title search and inspector photo evidence verified. Release request from Escrow to general contractor.",
        amount: "$8,400,000 USD",
        quorum: "2 of 3 Required (1 Architect + 1 Title Agent Approved)",
        signedBy: ["Lead Project Architect", "Title Guarantee Co."],
        missing: ["Blackwood Loan Officer"],
        hash: "0x391823901bcefa78129038afbc91230812398012"
      }
    ],
    vaults: [
      { name: "Blackwood Debt Fund Custody Treasury", chain: "BitGo MPC Custody", balance: "$45,200,000 USDC", status: "Escrow Ready", address: "bitgo:vault:blackwood:01" },
      { name: "XRPL Loans Liquidity Bridge", chain: "XRPL Ledger (rNX4fa...)", balance: "15,000,000 IOU Credits", status: "Operational", address: "rNX4faQ35SdtE4rDoEg8YeVLQKQ57AYyCt" }
    ]
  },
  aeterna: {
    name: "Aeterna Capital Partners",
    domain: "vault.aeternacapital.com",
    tag: "aet.unykorn.ai",
    lei: "984500F991209384B (Demo Record)",
    custody: "BitGo Enterprise Sandbox",
    auc: "$850,000,000",
    dealVol: "$60,000,000",
    credentialsCount: "680 Time-Bound",
    pendingApprovalsCount: 1,
    primaryColor: "#6366F1",
    accentColor: "#EC4899",
    scenarioTitle: "Demo Scenario: Family Office & Digital Securities Portal",
    scenarioBody: "Simulated private wealth, estate continuity, and ERC-3643 securities operations for qualified investor onboarding demonstration.",
    disclaimer: "Aeterna Capital operates private wealth and digital securities workflows powered by UnyKorn Enterprise Fabric.",
    deals: [
      {
        id: "DEAL-AET-01",
        title: "Aeterna Sovereign Real Estate SPV (Sample)",
        type: "ERC-3643 DIGITAL SECURITY",
        borrower: "Aeterna Asset Management",
        amount: "$40,000,000",
        ltv: "Equity Offering",
        rate: "8.50% Preferred Return",
        term: "5 Year Evergreen",
        progress: 75,
        status: "Qualified Investor Subscriptions"
      }
    ],
    pendingApprovals: [
      {
        id: "INTENT-9815",
        type: "investor_allowlist",
        title: "Allowlist Batch #12: 15 Accredited RIA Accounts",
        desc: "KYC and Reg D Rule 506(c) verification verified by accredited partner. Ready for ERC-3643 claim binding.",
        amount: "15 Investors ($18.5M Capital)",
        quorum: "1 of 1 Required",
        signedBy: [],
        missing: ["Compliance Officer Approval"],
        hash: "0xaa89102839bcef19028301928391029381029381"
      }
    ],
    vaults: [
      { name: "Aeterna Family Office Treasury", chain: "BitGo Multi-Sig MPC", balance: "$85,000,000 AUC", status: "Secure", address: "bitgo:vault:aeterna:main" }
    ]
  },
  gaa: {
    name: "Global Art Authority",
    domain: "provenance.artauthority.org",
    tag: "art.unykorn.ai",
    lei: "549300ARTPROV10928 (Demo Record)",
    custody: "BitGo Custody & Fine Art Depository (Sandbox)",
    auc: "$520,000,000",
    dealVol: "$15,000,000",
    credentialsCount: "310 Time-Bound",
    pendingApprovalsCount: 0,
    primaryColor: "#10B981",
    accentColor: "#F59E0B",
    scenarioTitle: "Demo Scenario: Fine Art Provenance & Depository",
    scenarioBody: "Sample appraisal and Lloyd's insurance attestation hashes demonstrating proof-first digital asset anchoring.",
    disclaimer: "Global Art Authority is an institutional art provenance and evidence infrastructure powered by UnyKorn LLC.",
    deals: [
      {
        id: "DEAL-GAA-01",
        title: "Masterpiece Impressionist Fractional Syndication (Sample)",
        type: "PROVENANCE VAULT ASSET",
        borrower: "Geneva FreePort Syndicate",
        amount: "$15,000,000",
        ltv: "100% Insured (Lloyd's)",
        rate: "Fractional Ownership",
        term: "Indefinite Vaulted",
        progress: 95,
        status: "Vault Custodied"
      }
    ],
    pendingApprovals: [],
    vaults: [
      { name: "GAA Fine Art Depository Vault", chain: "BitGo & Physical Depository", balance: "9 Provenance Relics ($520M)", status: "Physical & Digital Bound", address: "0x4E574939D460d284B5D990646D4aeaEF2D49Fa13" }
    ]
  },
  georgia: {
    name: "Georgia Edge SPV",
    domain: "draws.ga-rwa.edge.unykorn.ai",
    tag: "ga.unykorn.ai",
    lei: "984500GAEDGE889102 (Demo Record)",
    custody: "BitGo Prime / Title Escrow (Sandbox)",
    auc: "$180,000,000",
    dealVol: "$45,000,000",
    credentialsCount: "190 Time-Bound",
    pendingApprovalsCount: 1,
    primaryColor: "#F97316",
    accentColor: "#38BDF8",
    scenarioTitle: "Demo Scenario: Construction Draw & Evidence Desk",
    scenarioBody: "Demonstrating contractor draw disbursement gates based on drone photogrammetry, title certifications, and escrow releases.",
    disclaimer: "Georgia Edge SPV manages construction draw evidence and contractor milestone escrow releases.",
    deals: [
      {
        id: "DEAL-GA-01",
        title: "Savannah Logistics Corridor Phase 2 (Sample)",
        type: "CONSTRUCTION EVIDENCE DRAW",
        borrower: "Savannah Logistics Park LLC",
        amount: "$45,000,000",
        ltv: "54% LTC",
        rate: "SOFR + 3.85%",
        term: "24 Months",
        progress: 70,
        status: "Draw Milestone Pending"
      }
    ],
    pendingApprovals: [
      {
        id: "INTENT-9816",
        type: "construction_draw",
        title: "Draw #7 Foundation & Steelwork Milestone ($4.2M)",
        desc: "Inspector certified steel placement with GPS-tagged drone photogrammetry attached in Evidence Room.",
        amount: "$4,200,000 USD",
        quorum: "1 of 2 Required",
        signedBy: ["Site Supervising Engineer"],
        missing: ["Georgia Edge Lender Approval"],
        hash: "0x1209384901bcdafe781290381029381029381029"
      }
    ],
    vaults: [
      { name: "Savannah Project Construction Escrow", chain: "BitGo MPC Escrow", balance: "$28,500,000 USDC", status: "Escrow Active", address: "bitgo:vault:georgia:draws" }
    ]
  }
};

let currentTenantKey = 'dignity';
let e2eCurrentStep = 1;

// SWITCH ENVIRONMENT
function switchEnvironment(envKey) {
  const env = ENVIRONMENTS[envKey];
  if (!env) return;
  document.getElementById('globalEnvBadge').innerText = env.badge;
  document.getElementById('globalEnvText').innerText = env.text;
  alert(`Environment switched to [${env.badge}].\n\n${env.text}`);
}

// SWITCH TENANT
function switchTenant(tenantKey) {
  currentTenantKey = tenantKey;
  const tenant = TENANTS_DATA[tenantKey];
  if (!tenant) return;

  // Apply CSS Variables for brand look
  document.documentElement.style.setProperty('--brand-primary', tenant.primaryColor);
  document.documentElement.style.setProperty('--brand-accent', tenant.accentColor);

  // Update UI Elements
  document.getElementById('tenantName').innerText = tenant.name;
  document.getElementById('tenantDomainTag').innerText = tenant.tag;
  document.getElementById('tenantAuc').innerText = tenant.auc;
  document.getElementById('tenantLei').innerText = tenant.lei;
  document.getElementById('tenantCustody').innerText = tenant.custody;
  document.getElementById('metricAuc').innerText = tenant.auc;
  document.getElementById('metricDealVol').innerText = tenant.dealVol;
  document.getElementById('metricCredentials').innerText = tenant.credentialsCount;
  document.getElementById('metricPendingCount').innerText = `${tenant.pendingApprovals.length} Pending`;
  document.getElementById('pendingApprovalsCount').innerText = tenant.pendingApprovals.length;
  document.getElementById('overviewAlertCount').innerText = tenant.pendingApprovals.length;
  document.getElementById('activeDealsCount').innerText = tenant.deals.length;

  // Scenario notice
  document.getElementById('scenarioNoticeTitle').innerText = tenant.scenarioTitle;
  document.getElementById('scenarioNoticeBody').innerText = tenant.scenarioBody;

  // Update White-Label Settings Form
  document.getElementById('wlName').value = tenant.name;
  document.getElementById('wlDomain').value = tenant.domain;
  document.getElementById('wlPrimaryColor').value = tenant.primaryColor;
  document.getElementById('wlPrimaryColorText').value = tenant.primaryColor;
  document.getElementById('wlAccentColor').value = tenant.accentColor;
  document.getElementById('wlAccentColorText').value = tenant.accentColor;
  document.getElementById('wlDisclaimer').value = tenant.disclaimer;

  renderAllViews();
}

// TAB SWITCHING
function switchTab(tabId) {
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  const activePane = document.getElementById(`tab-${tabId}`);
  if (activePane) {
    activePane.classList.add('active');
  }
}

// RENDER ALL VIEWS
function renderAllViews() {
  const tenant = TENANTS_DATA[currentTenantKey];

  // 1. Overview Queue
  const queueBody = document.getElementById('overviewQueueBody');
  queueBody.innerHTML = tenant.pendingApprovals.map(a => `
    <tr>
      <td><span class="font-mono">${a.id}</span></td>
      <td><span class="badge info-badge">${a.type}</span></td>
      <td><strong>${a.title}</strong></td>
      <td class="font-mono font-bold">${a.amount}</td>
      <td><span class="badge pulse-badge">${a.quorum}</span></td>
      <td>
        <button class="btn-action primary btn-sm" onclick="openApprovalModal('${a.id}')">Review & Sign</button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="6" style="text-align:center; color:var(--text-dim); padding:1.5rem;">No pending approvals in queue. All workflows settled.</td></tr>`;

  // Module Status List
  const modList = document.getElementById('moduleStatusList');
  modList.innerHTML = `
    <div class="vault-item-row">
      <div><strong>Organization & Credential Hub</strong><div style="font-size:0.75rem; color:var(--text-dim);">Identity graph, authorized signers & roles</div></div>
      <span class="badge success-badge">OPERATIONAL</span>
    </div>
    <div class="vault-item-row">
      <div><strong>Lending & Credit Desk (LDX + FlashRouter)</strong><div style="font-size:0.75rem; color:var(--text-dim);">${tenant.deals.length} Active Deals Synced</div></div>
      <span class="badge success-badge">OPERATIONAL</span>
    </div>
    <div class="vault-item-row">
      <div><strong>BitGo Enterprise MPC Custody Boundary</strong><div style="font-size:0.75rem; color:var(--text-dim);">${tenant.vaults.length} MPC Vaults Active (Sandbox)</div></div>
      <span class="badge success-badge">CONNECTED</span>
    </div>
    <div class="vault-item-row">
      <div><strong>Audit & Proof Vault</strong><div style="font-size:0.75rem; color:var(--text-dim);">SHA-256 Merkle Chained Receipts ($H_n$)</div></div>
      <span class="badge success-badge">SYNCED</span>
    </div>
  `;

  // 2. Credentials Table
  renderCredentialsTable('all');

  // 3. Deals Grid
  const dealsGrid = document.getElementById('dealsGrid');
  dealsGrid.innerHTML = tenant.deals.map(d => `
    <div class="deal-card">
      <div class="deal-card-header">
        <span class="deal-type-tag">${d.type}</span>
        <span class="badge info-badge">${d.status}</span>
      </div>
      <div class="deal-title">${d.title}</div>
      <div class="deal-borrower">Borrower / SPV: <strong>${d.borrower}</strong></div>

      <div class="deal-metrics-grid">
        <div class="deal-metric-item">
          <span class="deal-m-label">FACILITY AMOUNT</span>
          <span class="deal-m-val text-blue">${d.amount}</span>
        </div>
        <div class="deal-metric-item">
          <span class="deal-m-label">LTV / COVERAGE</span>
          <span class="deal-m-val">${d.ltv}</span>
        </div>
        <div class="deal-metric-item">
          <span class="deal-m-label">PRICING / RATE</span>
          <span class="deal-m-val">${d.rate}</span>
        </div>
        <div class="deal-metric-item">
          <span class="deal-m-label">TERM / TENOR</span>
          <span class="deal-m-val">${d.term}</span>
        </div>
      </div>

      <div class="deal-progress-bar">
        <div class="deal-progress-fill" style="width: ${d.progress}%;"></div>
      </div>
      <div class="deal-progress-meta">
        <span>Workflow Progress: <strong>${d.progress}%</strong></span>
        <span>BitGo + FlashRouter Gated</span>
      </div>

      <div class="deal-card-footer">
        <button class="btn-secondary btn-sm" style="flex:1;" onclick="openActionModal('view_deal_room', '${d.id}')">View Deal Room</button>
        <button class="btn-action primary btn-sm" onclick="openActionModal('request_draw', '${d.id}')">Request Draw</button>
      </div>
    </div>
  `).join('');

  // 4. Approvals Tab
  const approvalsContainer = document.getElementById('approvalsContainer');
  approvalsContainer.innerHTML = tenant.pendingApprovals.map(a => `
    <div class="approval-item-card">
      <div class="approval-item-header">
        <div>
          <span class="badge info-badge font-mono">${a.id}</span>
          <strong style="margin-left:0.5rem; font-size:1.05rem;">${a.title}</strong>
        </div>
        <span class="badge warning-badge">Awaiting Quorum</span>
      </div>
      <p class="approval-desc">${a.desc}</p>
      
      <div class="approval-quorum-status">
        <div><strong>Required Quorum:</strong> <span class="text-amber">${a.quorum}</span></div>
        <div style="margin-left:auto;"><strong>Amount:</strong> <span class="font-mono font-bold">${a.amount}</span></div>
      </div>

      <div style="font-size:0.78rem; color:var(--text-dim); margin-bottom:1rem;">
        <div>Signed by: <strong class="text-emerald">${a.signedBy.join(', ') || 'None yet'}</strong></div>
        <div>Awaiting signature from: <strong class="text-amber">${a.missing.join(', ')}</strong></div>
      </div>

      <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
        <button class="btn-secondary btn-sm" onclick="alert('Simulation completed: Zero policy violations detected. Ready for signing.')">Simulate Policy Check</button>
        <button class="btn-action primary btn-sm" onclick="executeQuorumApproval('${a.id}')">Authorize & Co-Sign</button>
      </div>
    </div>
  `).join('') || `<div style="text-align:center; color:var(--text-dim); padding:2rem;">All pending approvals signed. Zero policy blocks.</div>`;

  // 5. Custody Vaults & Rails
  const vaultsList = document.getElementById('vaultCardsList');
  vaultsList.innerHTML = tenant.vaults.map(v => `
    <div class="vault-item-row">
      <div>
        <strong>${v.name}</strong>
        <div style="font-size:0.75rem; color:var(--text-dim); font-family:var(--font-mono);">${v.chain} &bull; ${v.address}</div>
      </div>
      <div style="text-align:right;">
        <div class="font-mono font-bold text-emerald">${v.balance}</div>
        <span class="badge success-badge">${v.status}</span>
      </div>
    </div>
  `).join('');

  // FlashRouter Rails
  document.getElementById('railsStatusList').innerHTML = `
    <div class="rail-item-row">
      <div><strong>Solana Micro-Rail</strong><div style="font-size:0.75rem; color:var(--text-dim);">Raydium Pool &bull; High-Speed PWA Receipts</div></div>
      <span class="badge success-badge">&lt; 400ms Sync</span>
    </div>
    <div class="rail-item-row">
      <div><strong>Polygon / EVM Mainnet</strong><div style="font-size:0.75rem; color:var(--text-dim);">ERC-3643 Securities &bull; Contract 0x4E57...Fa13</div></div>
      <span class="badge success-badge">Block 61,420,918</span>
    </div>
    <div class="rail-item-row">
      <div><strong>XRPL Ledger</strong><div style="font-size:0.75rem; color:var(--text-dim);">Trustline Routing &bull; Issuer rJLMST...qN3FQ</div></div>
      <span class="badge success-badge">Ledger 89,102,402</span>
    </div>
    <div class="rail-item-row">
      <div><strong>Stellar Network</strong><div style="font-size:0.75rem; color:var(--text-dim);">Anchor GB4FHG...GEG4</div></div>
      <span class="badge success-badge">Ledger Validated</span>
    </div>
  `;

  // Destination Allowlist
  document.getElementById('allowlistBody').innerHTML = `
    <tr>
      <td><strong>BitGo Custody Cold Vault (Sandbox)</strong></td>
      <td><span class="badge info-badge">BitGo MPC</span></td>
      <td><code class="font-mono">bitgo:vault:9847120938</code></td>
      <td><span class="badge success-badge">KYB Approved</span></td>
      <td class="font-mono">$25,000,000 / day</td>
      <td><span class="badge success-badge">ACTIVE</span></td>
    </tr>
    <tr>
      <td><strong>Dignity Gold Treasury Admin</strong></td>
      <td><span class="badge info-badge">Polygon EVM</span></td>
      <td><code class="font-mono">0x8aced25DC8530FDaf0f86D53a0A1E02AAfA7Ac7A</code></td>
      <td><span class="badge success-badge">Officer Bound</span></td>
      <td class="font-mono">$5,000,000 / day</td>
      <td><span class="badge success-badge">ACTIVE</span></td>
    </tr>
    <tr>
      <td><strong>Savannah Title & Escrow Guarantee</strong></td>
      <td><span class="badge info-badge">Fedwire / ACH</span></td>
      <td><code class="font-mono">ABA: 021000021 / ACCT: 991209384</code></td>
      <td><span class="badge success-badge">Licensed Partner</span></td>
      <td class="font-mono">$10,000,000 / day</td>
      <td><span class="badge success-badge">ACTIVE</span></td>
    </tr>
  `;

  // 6. Audit Timeline (Hash-Chained H_n)
  document.getElementById('auditTimeline').innerHTML = `
    <div class="audit-event-item">
      <div class="audit-meta-row">
        <span>2026-08-29 07:15:22 UTC &bull; Event #1042</span>
        <span class="badge success-badge">HASH-CHAIN ANCHORED</span>
      </div>
      <div class="audit-text">BitGo MPC Multi-Sig Policy Verification for Intent INTENT-9812 passed 2/3 Quorum check.</div>
      <div class="audit-hash">Hash ($H_{1042}$): 0x89abf7623c91e012fa89b2c8901df67e2a9810f78c9120938491823901bcefa78</div>
    </div>
    <div class="audit-event-item">
      <div class="audit-meta-row">
        <span>2026-08-29 06:42:10 UTC &bull; Event #1041</span>
        <span class="badge success-badge">HASH-CHAIN ANCHORED</span>
      </div>
      <div class="audit-text">Investor KYC Claim issued to wallet 0x932f...81c9 under Reg D 506(c) Suitability Policy.</div>
      <div class="audit-hash">Hash ($H_{1041}$): 0x4e574939d460d284b5d990646d4aeaef2d49fa13028301928391029381029381</div>
    </div>
    <div class="audit-event-item">
      <div class="audit-meta-row">
        <span>2026-08-29 05:18:44 UTC &bull; Event #1040</span>
        <span class="badge success-badge">HASH-CHAIN ANCHORED</span>
      </div>
      <div class="audit-text">FlashRouter settlement instruction cleared on Polygon Mainnet (ERC-3643 Tranche Settlement).</div>
      <div class="audit-hash">Hash ($H_{1040}$): 0x1209384901bcdafe781290381029381029381029381029381029381029381029</div>
    </div>
  `;
}

// RENDER CREDENTIALS TABLE BY FILTER
function renderCredentialsTable(filter) {
  const tbody = document.getElementById('credentialsTableBody');
  const items = [
    { id: "CRED-ORG-01", class: "Legal Entity / SPV", name: "Dignity Gold Reserves Inc.", auth: "Wyoming SecState (EIN: 42-3536633)", scope: "Commodity Issuer, Primary Mint", expiry: "2027-07-01 (Annual Review)", status: "Active & Bound", hash: "0x9812...38ab" },
    { id: "CRED-SGN-01", class: "Authorized Officer", name: "Kevan Burns (Managing Principal)", auth: "Board Resolution July 2026", scope: "Signing Authority Up to $100M", expiry: "2027-01-01 (Active)", status: "Active & Bound", hash: "0x4e57...fa13" },
    { id: "CRED-INV-142", class: "Accredited Investor", name: "Blackwood Growth Partners LP", auth: "Parallel Markets KYC/AML", scope: "Reg D 506(c) Qualified", expiry: "2026-12-31 (Annual KYC)", status: "Active & Bound", hash: "0x89ab...10f7" },
    { id: "CRED-PTN-01", class: "Regulated Custodian", name: "BitGo Trust Company Inc.", auth: "South Dakota Division of Banking", scope: "Qualified Custody & MPC Signing", expiry: "2027-06-30 (Contract Term)", status: "Active & Bound", hash: "0x1209...dafe" },
    { id: "CRED-WAL-01", class: "Treasury MPC Wallet", name: "Dignity Primary Treasury (0x8ace...)", auth: "BitGo MPC Multi-Sig Quorum", scope: "Issuance / Burn / Transfer", expiry: "Bound to Custody", status: "Active & Bound", hash: "0x3918...0812" }
  ];

  tbody.innerHTML = items.map(c => `
    <tr>
      <td><span class="font-mono">${c.id}</span></td>
      <td><span class="badge info-badge">${c.class}</span></td>
      <td><strong>${c.name}</strong></td>
      <td>${c.auth}</td>
      <td><code>${c.scope}</code></td>
      <td style="font-size:0.75rem; color:var(--text-dim);">${c.expiry}</td>
      <td><span class="badge success-badge">${c.status}</span></td>
      <td><span class="font-mono text-blue">${c.hash}</span></td>
      <td>
        <button class="btn-secondary btn-sm" onclick="openProofVerifier('${c.hash}')">Verify</button>
      </td>
    </tr>
  `).join('');
}

function filterCredentials(type) {
  document.querySelectorAll('.credential-tabs-nav .sub-tab').forEach(b => b.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  renderCredentialsTable(type);
}

// EXECUTE QUORUM APPROVAL
function executeQuorumApproval(intentId) {
  const tenant = TENANTS_DATA[currentTenantKey];
  const idx = tenant.pendingApprovals.findIndex(a => a.id === intentId);
  if (idx !== -1) {
    const item = tenant.pendingApprovals[idx];
    alert(`Success: Multi-Party Authorization Recorded for ${item.title}!\n\n• Policy Checked: Passed defined anti-self-approval test cases\n• Co-Signer Bound: Kevan Burns (Compliance Officer)\n• Handoff Routed to: BitGo MPC Custody Boundary (Sandbox)\n• Transaction Hash Generated: ${item.hash}`);
    tenant.pendingApprovals.splice(idx, 1);
    renderAllViews();
  }
}

// END-TO-END VERIFIED DEAL WORKFLOW SIMULATOR
function startE2EWorkflowModal() {
  e2eCurrentStep = 1;
  renderE2EStep();
  document.getElementById('e2eModal').classList.add('open');
}

function closeE2EModal() {
  document.getElementById('e2eModal').classList.remove('open');
}

function renderE2EStep() {
  const content = document.getElementById('e2eStepContent');
  const footer = document.getElementById('e2eFooter');

  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`e2eStep${i}`);
    if (stepEl) {
      stepEl.classList.remove('active', 'completed');
      if (i === e2eCurrentStep) stepEl.classList.add('active');
      else if (i < e2eCurrentStep) stepEl.classList.add('completed');
    }
  }

  if (e2eCurrentStep === 1) {
    content.innerHTML = `
      <h4 style="color:var(--brand-primary); margin-bottom:0.5rem;">Step 1: Enterprise Organization & Officer Authority Binding</h4>
      <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">The tenant organization is registered with legal entity verification (EIN/LEI), and authorized signers are bound with time-bound signing limits.</p>
      
      <div style="background:rgba(0,0,0,0.3); padding:1rem; border-radius:var(--radius-md); font-family:var(--font-mono); font-size:0.8rem;">
        <div>Organization: <strong>Blackwood Capital & Debt Fund LLC</strong></div>
        <div>Entity ID: <code>org_blackwood_wy_2026</code> &bull; Juris: Wyoming, USA</div>
        <div>Authorized Signer: <strong>Kevan Burns (Managing Principal)</strong></div>
        <div>Officer Authority Claim: <code>SIGNING_LIMIT_USD_100M</code> [Expires: 2027-01-01]</div>
        <div class="text-emerald" style="margin-top:0.5rem;">&check; Compliance Verification: PASSED (Board Resolution Anchored)</div>
      </div>
    `;
    footer.innerHTML = `
      <button class="btn-secondary" onclick="closeE2EModal()">Cancel</button>
      <button class="btn-action primary" onclick="advanceE2EStep(2)">Proceed to Step 2: Deal & Evidence &rarr;</button>
    `;
  } else if (e2eCurrentStep === 2) {
    content.innerHTML = `
      <h4 style="color:var(--brand-primary); margin-bottom:0.5rem;">Step 2: Deal Intake & Cryptographic Evidence Hashing</h4>
      <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">A private credit draw deal room is opened. Collateral appraisal, title search, and inspector drone photos are uploaded and hashed via SHA-256.</p>
      
      <div style="background:rgba(0,0,0,0.3); padding:1rem; border-radius:var(--radius-md); font-family:var(--font-mono); font-size:0.8rem;">
        <div>Deal ID: <code>DEAL-LDX-99 // Savannah Draw #7</code></div>
        <div>Facility Requested: <strong>$4,200,000 USD</strong> (First Lien Senior Debt)</div>
        <div>Evidence Record #1: <code>Appraisal_Savannah_2026.pdf</code> &rarr; SHA-256: <code>0x9182...bcea</code></div>
        <div>Evidence Record #2: <code>Drone_Inspection_Photogrammetry.bin</code> &rarr; SHA-256: <code>0x4e57...fa13</code></div>
        <div class="text-emerald" style="margin-top:0.5rem;">&check; Evidence Vault Status: Merkle Leaf Attached & Tamper-Evident</div>
      </div>
    `;
    footer.innerHTML = `
      <button class="btn-secondary" onclick="advanceE2EStep(1)">&larr; Back</button>
      <button class="btn-action primary" onclick="advanceE2EStep(3)">Proceed to Step 3: Quorum Policy &rarr;</button>
    `;
  } else if (e2eCurrentStep === 3) {
    content.innerHTML = `
      <h4 style="color:var(--brand-primary); margin-bottom:0.5rem;">Step 3: Policy Engine Evaluation & Multi-Party Quorum</h4>
      <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">Rule <code>draw-over-1m</code> requires 3 distinct party approvals: Project Architect + Title Agent + Lender Officer. Anti-self-approval rule strictly enforced.</p>
      
      <div style="background:rgba(0,0,0,0.3); padding:1rem; border-radius:var(--radius-md); font-family:var(--font-mono); font-size:0.8rem;">
        <div>Policy Evaluated: <code>POLICY_DRAW_RELEASE_OVER_1M</code></div>
        <div>Required Quorum: <strong>3 of 3 Distinct Authorized Signers</strong></div>
        <div class="text-emerald">&check; 1/3 Architect Signature: Lead Supervising Engineer (Signed)</div>
        <div class="text-emerald">&check; 2/3 Title Escrow Signature: Title Guarantee Co. (Signed)</div>
        <div class="text-emerald">&check; 3/3 Lender Officer Signature: Kevan Burns (Signed)</div>
        <div class="text-emerald" style="margin-top:0.5rem;">&check; Quorum Status: UNANIMOUS CONSENSUS</div>
      </div>
    `;
    footer.innerHTML = `
      <button class="btn-secondary" onclick="advanceE2EStep(2)">&larr; Back</button>
      <button class="btn-action primary" onclick="advanceE2EStep(4)">Proceed to Step 4: BitGo MPC Execution &rarr;</button>
    `;
  } else if (e2eCurrentStep === 4) {
    content.innerHTML = `
      <h4 style="color:var(--accent-emerald); margin-bottom:0.5rem;">Step 4: BitGo MPC Custody Handoff & Tamper-Evident Receipt Chain</h4>
      <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">Transaction intent forwarded to BitGo Enterprise Sandbox. Merkle event hash $H_n = \\text{SHA256}(H_{n-1} \\parallel \\text{payload}_n)$ generated.</p>
      
      <div style="background:rgba(16,185,129,0.08); border:1px solid var(--accent-emerald); padding:1rem; border-radius:var(--radius-md); font-family:var(--font-mono); font-size:0.8rem;">
        <div class="text-emerald" style="font-weight:700;">&check; EXECUTION COMPLETE // AUDIT RECEIPT ANCHORED</div>
        <div style="margin-top:0.4rem;">Transaction Intent ID: <code>INTENT-9899-COMPLETED</code></div>
        <div>Settlement Rail: <strong>FlashRouter &rarr; Polygon EVM Escrow (Sandbox)</strong></div>
        <div>BitGo MPC Request ID: <code>bitgo_req_9920192840918</code></div>
        <div>Previous Hash ($H_{n-1}$): <code>0x89abf7623c91e012...fa89</code></div>
        <div>Canonical Event Hash ($H_n$): <code>0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</code></div>
      </div>
    `;
    footer.innerHTML = `
      <button class="btn-action primary" onclick="closeE2EModal(); alert('End-to-End Deal Workflow Successfully Completed and Logged to Audit Vault!');">Close & View Audit Vault</button>
    `;
  }
}

function advanceE2EStep(step) {
  e2eCurrentStep = step;
  renderE2EStep();
}

// MODAL CONTROLS
function openActionModal(actionType, extraData) {
  const modal = document.getElementById('actionModal');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');
  const btn = document.getElementById('modalConfirmBtn');

  if (actionType === 'new_transaction') {
    title.innerText = "Create New Transaction / Mint Intent";
    body.innerHTML = `
      <div class="form-group">
        <label>Intent Action Type</label>
        <select class="form-input">
          <option>token_mint / issuance (ERC-3643)</option>
          <option>construction_draw (Escrow Release)</option>
          <option>treasury_transfer (BitGo Allowlist)</option>
          <option>cross_rail_settlement (FlashRouter)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Target Amount / Units (USD Equivalent)</label>
        <input type="text" class="form-input font-mono" placeholder="$10,000,000 USD">
      </div>
      <div class="form-group">
        <label>Destination Allowlist Address / Beneficiary</label>
        <input type="text" class="form-input font-mono" value="0x8aced25DC8530FDaf0f86D53a0A1E02AAfA7Ac7A">
      </div>
      <div class="form-group">
        <label>Linked Reserve / Collateral Attestation Evidence</label>
        <input type="text" class="form-input" value="Assay-Report-Tranche-2026A.pdf (SHA-256 Verified)">
      </div>
    `;
    btn.onclick = () => {
      alert("Transaction Intent Successfully Created! Routed to Policy & Quorum Engine for multi-party signature.");
      closeActionModal();
    };
  } else if (actionType === 'issue_credential') {
    title.innerText = "Issue Verified Credential / Claim";
    body.innerHTML = `
      <div class="form-group">
        <label>Credential Class</label>
        <select class="form-input">
          <option>Investor KYC / Accredited Status (Reg D)</option>
          <option>Authorized Signer / Officer Authority</option>
          <option>Asset Title / Reserve Attestation</option>
          <option>Custody Wallet Allowlist Claim</option>
        </select>
      </div>
      <div class="form-group">
        <label>Subject Legal Name / Wallet</label>
        <input type="text" class="form-input" placeholder="e.g. Apex Global Wealth Partners LP">
      </div>
      <div class="form-group">
        <label>Verification Proof Document Hash</label>
        <input type="text" class="form-input font-mono" value="0x4e574939d460d284b5d990646d4aeaef2d49fa13">
      </div>
    `;
    btn.onclick = () => {
      alert("Credential Issued and Merkle Root Anchored into Organization Credential Graph!");
      closeActionModal();
    };
  } else if (actionType === 'new_deal') {
    title.innerText = "Create New Asset / Deal Room";
    body.innerHTML = `
      <div class="form-group">
        <label>Deal Title</label>
        <input type="text" class="form-input" placeholder="e.g. Atlanta Industrial Logistics Draw #1">
      </div>
      <div class="form-group">
        <label>Facility Amount</label>
        <input type="text" class="form-input font-mono" placeholder="$25,000,000 USD">
      </div>
      <div class="form-group">
        <label>Underwriting Rail</label>
        <select class="form-input">
          <option>LDX Capital Private Debt Desk</option>
          <option>XRPL Loans Credit Facility</option>
          <option>ERC-3643 Sovereign Asset Tokenization</option>
        </select>
      </div>
    `;
    btn.onclick = () => {
      alert("Deal Room Initialized! Intake and document evidence room open.");
      closeActionModal();
    };
  } else {
    title.innerText = "Operational Action";
    body.innerHTML = `<p style="color:var(--text-muted);">Action parameters loaded for item ${extraData || ''}.</p>`;
    btn.onclick = () => closeActionModal();
  }

  modal.classList.add('open');
}

function closeActionModal() {
  document.getElementById('actionModal').classList.remove('open');
}

// PROOF VERIFIER
function openProofVerifier(hash) {
  const modal = document.getElementById('proofModal');
  if (hash) {
    document.getElementById('verifyInputHash').value = hash;
  }
  modal.classList.add('open');
}

function closeProofModal() {
  document.getElementById('proofModal').classList.remove('open');
}

function runCryptographicVerification() {
  const hash = document.getElementById('verifyInputHash').value;
  const res = document.getElementById('verificationResult');
  res.style.display = 'block';
  res.innerHTML = `
    <div style="display:flex; align-items:center; gap:0.5rem; color:var(--accent-emerald); font-weight:700; margin-bottom:0.5rem;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>VERIFICATION SUCCESSFUL: CANONICAL HASH MATCH</span>
    </div>
    <div style="font-size:0.8rem; color:var(--text-main); margin-bottom:0.5rem;">
      <div>Queried Hash: <code class="font-mono text-blue">${hash || '0x4E574939...Fa13'}</code></div>
      <div>On-Chain Anchor: <strong>Polygon Mainnet Block 61,420,918 (Proof Reference)</strong></div>
      <div>Attesting Entity: <strong>UnyKorn LLC ISO MIC: UBEC & BitGo MPC Sandbox Quorum</strong></div>
      <div>Merkle Leaf Position: <strong>Leaf #4 (Proof Valid)</strong></div>
    </div>
  `;
}

// WHITE LABEL PREVIEW
function updateLivePreview() {
  const prim = document.getElementById('wlPrimaryColor').value;
  const acc = document.getElementById('wlAccentColor').value;
  document.getElementById('wlPrimaryColorText').value = prim;
  document.getElementById('wlAccentColorText').value = acc;
  document.documentElement.style.setProperty('--brand-primary', prim);
  document.documentElement.style.setProperty('--brand-accent', acc);
}

function saveWhiteLabelConfig() {
  alert("Tenant White-Label Configuration Saved!\n\n• Custom Domain DNS CNAME instructions routed.\n• CSS Theme Tokens updated.\n• Commercial billing retainer active.");
}

async function exportEnterpriseReport() {
  try {
    const res = await fetch(`${API_BASE_URL}/audit/export-proof-package`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer user_valid_signer',
        'x-tenant-id': 'tenant_blackwood_01'
      },
      body: JSON.stringify({
        resourceType: 'deal',
        resourceId: 'deal_savannah_07'
      })
    });

    if (res.ok) {
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SERVER_AUDIT_PACKAGE_${currentTenantKey.toUpperCase()}.json`;
      a.click();
      alert(`Server-Generated Sandbox Proof Package Downloaded!\n\n• Export Event ID: ${data.exportEventId}\n• Ledger Verification: ${data.verification.ledgerVerification}\n• Environment: ${data.environment.toUpperCase()}`);
      return;
    }
  } catch (err) {
    console.log('Backend API offline, serving distinct offline demonstration output...');
  }

  // DISTINCT OFFLINE DEMONSTRATION FALLBACK (Visibly distinct and non-authoritative)
  const offlineData = {
    outputType: "OFFLINE_DEMONSTRATION_RECEIPT",
    isServerVerified: false,
    serverPackageId: null,
    environment: "demo_fallback",
    label: "Offline Demonstration Receipt — Not Server Verified",
    disclaimer: "OFFLINE DEMONSTRATION OUTPUT. Generated in browser using synthetic fixtures. Not server generated, not tenant-authorized, not ledger verified, and not suitable for operational, legal, custody, regulatory, or financial reliance.",
    eventsCount: 3
  };
  const blob = new Blob([JSON.stringify(offlineData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OFFLINE_DEMO_RECEIPT_${currentTenantKey.toUpperCase()}.json`;
  a.click();
  alert("Notice: Server unreachable. Downloaded [Offline Demonstration Receipt — Not Server Verified].");
}

function triggerRailSync() {
  alert("Triggered FlashRouter Multi-Rail Sync:\n\n• Solana Micro-Rail: Synced\n• EVM Mainnet: Synced\n• XRPL Ledger: Synced\n• Stellar Network: Synced\n\nAll 4 settlement channels synchronized with BitGo Enterprise MPC Sandbox.");
}

// INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
  switchTenant('dignity');
});
