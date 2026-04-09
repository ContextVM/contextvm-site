<script lang="ts">
  import Seo from '$lib/components/SEO.svelte';

  let activePath = $state<'cvmi' | 'ts'>('cvmi');

  // Orange accent — matches contextvm.org "Read docs" button
  const ACCENT       = '#E8550A';
  const ACCENT_LIGHT = '#FDE9DF';
  const ACCENT_DARK  = '#A33A05';

  function copyCode(text: string, btn: HTMLButtonElement) {
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'copied';
      setTimeout(() => (btn.textContent = 'copy'), 1500);
    }).catch(() => {
      btn.textContent = 'copy';
    });
  }
</script>

<Seo
  title="Self-Host a Server | ContextVM"
  description="A complete guide to hosting a ContextVM server on the Nostr network. Choose your path — no-code CLI with CVMI or custom integration with the TypeScript SDK."
/>

<main class="sh-page">

  <!-- ── Hero ─────────────────────────────────────────────────────── -->
  <div class="sh-hero">
    <div class="sh-badge" style="background:{ACCENT_LIGHT}; color:{ACCENT_DARK};">
      Self-hosting guide
    </div>
    <h1 class="sh-h1">Host your own ContextVM server</h1>
    <p class="sh-lead">
      Expose any MCP server to the decentralised Nostr network in minutes.
      Pick your path below.
    </p>
  </div>

  <!-- ── Content ───────────────────────────────────────────────────── -->
  <div class="sh-content">

    <div class="sh-label">Choose your approach</div>

    <!-- Path chooser -->
    <div class="sh-chooser">
      <button
        class="sh-card"
        style="border-color:{activePath === 'cvmi' ? ACCENT : 'rgba(128,128,128,0.25)'}; border-width:{activePath === 'cvmi' ? '2px' : '0.5px'};"
        onclick={() => (activePath = 'cvmi')}
      >
        <div class="sh-icon">⚡</div>
        <h3 class="sh-card-title">CVMI (CLI tool)</h3>
        <p class="sh-card-desc">Quickest way to get a server running. No code required — just a terminal.</p>
        <span class="sh-tag" style="background:{ACCENT_LIGHT}; color:{ACCENT_DARK};">Recommended for beginners</span>
      </button>

      <button
        class="sh-card"
        style="border-color:{activePath === 'ts' ? ACCENT : 'rgba(128,128,128,0.25)'}; border-width:{activePath === 'ts' ? '2px' : '0.5px'};"
        onclick={() => (activePath = 'ts')}
      >
        <div class="sh-icon">🛠</div>
        <h3 class="sh-card-title">TypeScript SDK</h3>
        <p class="sh-card-desc">Build a custom server with full control over transport, keys, and behaviour.</p>
        <span class="sh-tag" style="background:#E6F1FB; color:#185FA5;">For developers</span>
      </button>
    </div>

    <!-- ── CVMI PATH ─────────────────────────────────────────────── -->
    {#if activePath === 'cvmi'}
      <div class="sh-label">Step-by-step — CVMI path</div>
      <div class="sh-steps">

        <div class="sh-step">
          <div class="sh-step-line">
            <div class="sh-num" style="background:{ACCENT}; color:#fff;">1</div>
            <div class="sh-connector"></div>
          </div>
          <div class="sh-body">
            <h4 class="sh-step-title">Check prerequisites</h4>
            <p class="sh-step-desc">You need Node.js 18 or higher installed. That's it — no global installs required.</p>
            <div class="sh-prereq-grid">
              <div class="sh-prereq">
                <div class="sh-check" style="background:{ACCENT};">
                  <svg viewBox="0 0 10 10" fill="none" width="10" height="10">
                    <polyline points="2,5 4,7.5 8,3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                Node.js 18 or higher
              </div>
              <div class="sh-prereq">
                <div class="sh-check" style="background:{ACCENT};">
                  <svg viewBox="0 0 10 10" fill="none" width="10" height="10">
                    <polyline points="2,5 4,7.5 8,3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                npm, yarn, pnpm, or bun
              </div>
            </div>
            <div class="sh-tip" style="background:{ACCENT_LIGHT}; border-left-color:{ACCENT}; color:{ACCENT_DARK};">
              Check your Node version: <code style="color:{ACCENT_DARK}; font-family:monospace;">node --version</code>
            </div>
          </div>
        </div>

        <div class="sh-step">
          <div class="sh-step-line">
            <div class="sh-num" style="background:{ACCENT}; color:#fff;">2</div>
            <div class="sh-connector"></div>
          </div>
          <div class="sh-body">
            <h4 class="sh-step-title">Verify CVMI works</h4>
            <p class="sh-step-desc">No installation needed. Run this once to confirm everything is set up correctly.</p>
            <div class="sh-code">
              <span>npx cvmi --help</span>
              <button class="sh-copy" onclick={(e) => copyCode('npx cvmi --help', e.currentTarget)}>copy</button>
            </div>
            <div class="sh-tip" style="background:{ACCENT_LIGHT}; border-left-color:{ACCENT}; color:{ACCENT_DARK};">
              You should see a list of available commands. If you do, you're ready.
            </div>
          </div>
        </div>

        <div class="sh-step">
          <div class="sh-step-line">
            <div class="sh-num" style="background:{ACCENT}; color:#fff;">3</div>
            <div class="sh-connector"></div>
          </div>
          <div class="sh-body">
            <h4 class="sh-step-title">Start your server</h4>
            <p class="sh-step-desc">
              This exposes a local filesystem MCP server to the Nostr network.
              A cryptographic key pair is auto-generated for you.
            </p>
            <div class="sh-code">
              <span>npx cvmi serve -- npx -y @modelcontextprotocol/server-filesystem /tmp</span>
              <button class="sh-copy" onclick={(e) => copyCode('npx cvmi serve -- npx -y @modelcontextprotocol/server-filesystem /tmp', e.currentTarget)}>copy</button>
            </div>
            <div class="sh-tip" style="background:{ACCENT_LIGHT}; border-left-color:{ACCENT}; color:{ACCENT_DARK};">
              Your server's public key (<code style="color:{ACCENT_DARK}; font-family:monospace;">npub1...</code>) will print in the terminal. Save it — you'll need it to connect clients.
            </div>
          </div>
        </div>

        <div class="sh-step">
          <div class="sh-step-line">
            <div class="sh-num" style="background:{ACCENT}; color:#fff;">4</div>
            <div class="sh-connector"></div>
          </div>
          <div class="sh-body">
            <h4 class="sh-step-title">Connect a client</h4>
            <p class="sh-step-desc">From another machine or MCP client, connect using your server's public key.</p>
            <div class="sh-code">
              <span>npx cvmi use npub1q...</span>
              <button class="sh-copy" onclick={(e) => copyCode('npx cvmi use npub1q...', e.currentTarget)}>copy</button>
            </div>
          </div>
        </div>

        <div class="sh-step">
          <div class="sh-step-line">
            <div class="sh-num" style="background:{ACCENT}; color:#fff;">5</div>
            <div class="sh-connector"></div>
          </div>
          <div class="sh-body">
            <h4 class="sh-step-title">Optional: configure your server</h4>
            <p class="sh-step-desc">
              Create a <code style="font-family:monospace;">.cvmi.json</code> in your project folder to set relays,
              encryption, and a persistent private key.
            </p>
            <pre class="sh-code sh-pre">{`{
  "serve": {
    "privateKey": "nsec1...",
    "relays": ["wss://relay.damus.io"],
    "encryption": "required",
    "public": true
  }
}`}</pre>
            <div class="sh-tip" style="background:{ACCENT_LIGHT}; border-left-color:{ACCENT}; color:{ACCENT_DARK};">
              Full reference:
              <a href="https://docs.contextvm.org/cvmi/configuration/" target="_blank" rel="noopener"
                style="color:{ACCENT_DARK}; font-weight:600;">
                docs.contextvm.org/cvmi/configuration
              </a>
            </div>
          </div>
        </div>

      </div>
    {/if}

    <!-- ── TYPESCRIPT SDK PATH ───────────────────────────────────── -->
    {#if activePath === 'ts'}
      <div class="sh-label">Step-by-step — TypeScript SDK path</div>
      <div class="sh-steps">

        <div class="sh-step">
          <div class="sh-step-line">
            <div class="sh-num" style="background:{ACCENT}; color:#fff;">1</div>
            <div class="sh-connector"></div>
          </div>
          <div class="sh-body">
            <h4 class="sh-step-title">Install the SDK</h4>
            <p class="sh-step-desc">Add the ContextVM TypeScript SDK to your project.</p>
            <div class="sh-code">
              <span>npm install @contextvm/sdk</span>
              <button class="sh-copy" onclick={(e) => copyCode('npm install @contextvm/sdk', e.currentTarget)}>copy</button>
            </div>
          </div>
        </div>

        <div class="sh-step">
          <div class="sh-step-line">
            <div class="sh-num" style="background:{ACCENT}; color:#fff;">2</div>
            <div class="sh-connector"></div>
          </div>
          <div class="sh-body">
            <h4 class="sh-step-title">Understand the core building blocks</h4>
            <p class="sh-step-desc">
              Before writing code, get familiar with the three concepts that power every
              ContextVM integration: <strong>transports</strong>, <strong>signers</strong>,
              and <strong>relay handlers</strong>.
            </p>
            <div class="sh-tip" style="background:{ACCENT_LIGHT}; border-left-color:{ACCENT}; color:{ACCENT_DARK};">
              Start with the
              <a href="https://docs.contextvm.org/ts-sdk/quick-overview/" target="_blank" rel="noopener"
                style="color:{ACCENT_DARK}; font-weight:600;">SDK Quick Overview</a>
              — it maps out what each module does and how they fit together.
            </div>
          </div>
        </div>

        <div class="sh-step">
          <div class="sh-step-line">
            <div class="sh-num" style="background:{ACCENT}; color:#fff;">3</div>
            <div class="sh-connector"></div>
          </div>
          <div class="sh-body">
            <h4 class="sh-step-title">Choose the right component for hosting</h4>
            <p class="sh-step-desc">Two components handle the server side:</p>
            <div class="sh-prereq-grid">
              <div class="sh-prereq" style="flex-direction:column; align-items:flex-start; gap:4px;">
                <strong style="font-size:13px;">NostrMCPGateway</strong>
                <span>Exposes an existing MCP server to the Nostr network</span>
              </div>
              <div class="sh-prereq" style="flex-direction:column; align-items:flex-start; gap:4px;">
                <strong style="font-size:13px;">NostrMCPProxy</strong>
                <span>Bridges a Nostr server to a local stdio MCP client</span>
              </div>
            </div>
            <div class="sh-tip" style="background:{ACCENT_LIGHT}; border-left-color:{ACCENT}; color:{ACCENT_DARK};">
              See
              <a href="https://docs.contextvm.org/ts-sdk/gateway/overview/" target="_blank" rel="noopener"
                style="color:{ACCENT_DARK}; font-weight:600;">Gateway docs</a>
              and
              <a href="https://docs.contextvm.org/ts-sdk/proxy/overview/" target="_blank" rel="noopener"
                style="color:{ACCENT_DARK}; font-weight:600;">Proxy docs</a>
              for implementation details.
            </div>
          </div>
        </div>

        <div class="sh-step">
          <div class="sh-step-line">
            <div class="sh-num" style="background:{ACCENT}; color:#fff;">4</div>
            <div class="sh-connector"></div>
          </div>
          <div class="sh-body">
            <h4 class="sh-step-title">Run the client-server tutorial</h4>
            <p class="sh-step-desc">
              Work through the hands-on example to see a full server and client
              interaction in TypeScript before writing your own.
            </p>
            <div class="sh-tip" style="background:{ACCENT_LIGHT}; border-left-color:{ACCENT}; color:{ACCENT_DARK};">
              Found under Tutorials →
              <a href="https://docs.contextvm.org/ts-sdk/tutorials/client-server-communication/"
                target="_blank" rel="noopener"
                style="color:{ACCENT_DARK}; font-weight:600;">Client-Server Communication</a>
              in the docs sidebar.
            </div>
          </div>
        </div>

        <div class="sh-step">
          <div class="sh-step-line">
            <div class="sh-num" style="background:{ACCENT}; color:#fff;">5</div>
            <div class="sh-connector"></div>
          </div>
          <div class="sh-body">
            <h4 class="sh-step-title">Go live</h4>
            <p class="sh-step-desc">
              Once built, your server needs a Nostr private key and relay configuration
              to go live on the network. Pass keys and relays directly into the SDK's
              transport options.
            </p>
            <div class="sh-tip" style="background:{ACCENT_LIGHT}; border-left-color:{ACCENT}; color:{ACCENT_DARK};">
              Want to charge clients for access? Set up
              <a href="https://docs.contextvm.org/ts-sdk/payments/overview/" target="_blank" rel="noopener"
                style="color:{ACCENT_DARK}; font-weight:600;">Lightning payments via CEP-8</a>.
            </div>
          </div>
        </div>

      </div>
    {/if}

    <hr class="sh-divider" />

    <!-- What's next -->
    <div class="sh-label">What's next</div>
    <div class="sh-next-grid">
      <div class="sh-next-card">
        <h5 class="sh-next-title">Add skills</h5>
        <p class="sh-next-desc">Install reference implementations and templates to accelerate development.</p>
        <a class="sh-next-link" style="color:{ACCENT};"
          href="https://docs.contextvm.org/cvmi/skills/overview/" target="_blank" rel="noopener">
          Learn about skills →
        </a>
      </div>
      <div class="sh-next-card">
        <h5 class="sh-next-title">Publish your server</h5>
        <p class="sh-next-desc">Make your server publicly discoverable on the Nostr network.</p>
        <a class="sh-next-link" style="color:{ACCENT};"
          href="https://docs.contextvm.org/spec/ceps/cep-6/" target="_blank" rel="noopener">
          Server announcements →
        </a>
      </div>
      <div class="sh-next-card">
        <h5 class="sh-next-title">Add payments</h5>
        <p class="sh-next-desc">Charge clients for using your server via the Lightning Network.</p>
        <a class="sh-next-link" style="color:{ACCENT};"
          href="https://docs.contextvm.org/ts-sdk/payments/overview/" target="_blank" rel="noopener">
          Set up payments →
        </a>
      </div>
    </div>

  </div>
</main>

<style>
  /* All classes prefixed sh- to avoid collision with any global site styles */

  .sh-page {
    max-width: 860px;
    margin: 2rem auto;
    padding: 0 1rem 4rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  }

  .sh-hero   { text-align: center; padding: 3rem 1rem 2rem; }
  .sh-badge  { display: inline-block; font-size: 12px; font-weight: 500; padding: 4px 14px; border-radius: 20px; margin-bottom: 1rem; }
  .sh-h1     { font-size: 2rem; font-weight: 500; margin: 0 0 0.75rem; line-height: 1.3; }
  .sh-lead   { font-size: 1rem; max-width: 500px; margin: 0 auto; line-height: 1.6; opacity: 0.7; }

  .sh-content { }

  .sh-label {
    font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
    text-transform: uppercase; opacity: 0.5; margin-top: 2rem; margin-bottom: 1rem;
  }

  .sh-chooser { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 2rem; }
  .sh-card {
    background: transparent; border-style: solid; border-radius: 12px;
    padding: 1.25rem; cursor: pointer; text-align: left; color: inherit;
    font-family: inherit; transition: border-color 0.15s, border-width 0.15s;
  }
  .sh-icon       { font-size: 18px; margin-bottom: 10px; }
  .sh-card-title { font-size: 15px; font-weight: 500; margin: 0 0 5px; }
  .sh-card-desc  { font-size: 13px; opacity: 0.65; line-height: 1.5; margin: 0; }
  .sh-tag        { display: inline-block; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; margin-top: 10px; }

  .sh-steps  { display: flex; flex-direction: column; }
  .sh-step   { display: grid; grid-template-columns: 48px 1fr; }
  .sh-step-line { display: flex; flex-direction: column; align-items: center; }
  .sh-num {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; flex-shrink: 0;
  }
  .sh-connector { width: 1px; background: rgba(128,128,128,0.2); flex: 1; margin: 5px 0; min-height: 20px; }
  .sh-step:last-child .sh-connector { display: none; }
  .sh-body       { padding-bottom: 1.75rem; }
  .sh-step-title { font-size: 15px; font-weight: 500; margin: 4px 0 5px; }
  .sh-step-desc  { font-size: 14px; opacity: 0.65; line-height: 1.6; margin: 0 0 10px; }

  .sh-code {
    background: rgba(128,128,128,0.1); border: 0.5px solid rgba(128,128,128,0.2);
    border-radius: 8px; padding: 10px 14px;
    font-family: 'SFMono-Regular', 'Consolas', monospace; font-size: 13px;
    display: flex; justify-content: space-between; align-items: center; gap: 12px; word-break: break-all;
  }
  .sh-pre { display: block; white-space: pre; overflow-x: auto; line-height: 1.6; }
  .sh-copy {
    font-size: 11px; opacity: 0.5; background: none;
    border: 0.5px solid rgba(128,128,128,0.3); border-radius: 4px;
    padding: 3px 10px; cursor: pointer; flex-shrink: 0; font-family: inherit; color: inherit;
  }
  .sh-copy:hover { opacity: 0.8; }

  /* Tip — colours applied via inline style so they're never overridden */
  .sh-tip {
    border-left-style: solid; border-left-width: 3px;
    border-radius: 0 8px 8px 0; padding: 10px 14px;
    font-size: 13px; margin-top: 10px; line-height: 1.55;
  }

  .sh-prereq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
  .sh-prereq {
    background: rgba(128,128,128,0.1); border-radius: 8px;
    padding: 10px 14px; font-size: 13px; opacity: 0.8;
    display: flex; align-items: center; gap: 8px;
  }
  .sh-check { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  .sh-divider { border: none; border-top: 0.5px solid rgba(128,128,128,0.2); margin: 2rem 0; }

  .sh-next-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .sh-next-card { background: rgba(128,128,128,0.08); border: 0.5px solid rgba(128,128,128,0.2); border-radius: 12px; padding: 1rem; }
  .sh-next-title { font-size: 13px; font-weight: 500; margin: 0 0 5px; }
  .sh-next-desc  { font-size: 12px; opacity: 0.6; line-height: 1.5; margin: 0; }
  .sh-next-link  { font-size: 12px; margin-top: 8px; display: block; text-decoration: none; }
  .sh-next-link:hover { text-decoration: underline; }

  @media (max-width: 600px) {
    .sh-chooser     { grid-template-columns: 1fr; }
    .sh-next-grid   { grid-template-columns: 1fr; }
    .sh-prereq-grid { grid-template-columns: 1fr; }
    .sh-h1          { font-size: 1.5rem; }
  }
</style>