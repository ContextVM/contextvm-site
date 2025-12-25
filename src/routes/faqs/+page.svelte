<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import DOMPurify from 'dompurify';
	import { browser } from '$app/environment';
	import SEO from '$lib/components/SEO.svelte';

	// FAQ data structure
	interface FAQ {
		question: string;
		answer: string;
	}

	// FAQ data
	const faqs: FAQ[] = [
		{
			question: 'What is ContextVM?',
			answer: `<p>ContextVM is a decentralized protocol that enables Model Context Protocol (MCP) servers and clients to communicate over the Nostr network. It uses Nostr as a secure, distributed transport layer—leveraging cryptographic keys for identity, decentralized discovery, and Bitcoin-powered micropayments.</p>
			<p>Rather than relying on centralized infrastructure like domains, OAuth, or cloud hosting, ContextVM allows anyone to run or access services using only Nostr and a internet-connected device. It transforms any computational service into a discoverable, accessible, and monetizable resource—while preserving privacy, security, and user sovereignty.</p>`
		},
		{
			question: 'Why run MCP over Nostr?',
			answer: `<p>Running MCP over Nostr eliminates traditional infrastructure barriers:</p>
			<ul>
				<li>No need for a domain name, DNS setup, or static IP</li>
				<li>No OAuth, API keys, or centralized authentication</li>
				<li>No public hosting, server provisioning, or port forwarding</li>
			</ul>
			<p>Nostr provides:</p>
			<ul>
				<li><strong>Identity</strong> via public/private key cryptography</li>
				<li><strong>Discovery</strong> through service announcements on relays</li>
				<li><strong>Transport</strong> via signed and encrypted Nostr events</li>
				<li><strong>Payments</strong> (optional) using Bitcoin and the Lightning Network</li>
			</ul>
			<p>This enables a new model: <strong>you can run your own infrastructure</strong>, from any device, and expose it securely to the world—or keep it private—without depending on third parties.</p>`
		},
		{
			question: 'How does ContextVM achieve decentralization?',
			answer: `<p>ContextVM uses Nostr relays as a <strong>distributed message bus</strong>. Servers publish service announcements (or not, if private), and clients discover and connect to them using only public keys.</p>
			<p>There is no central directory, gatekeeper, or required service provider. Anyone can run a server, announce it (or not), accept requests, and optionally receive payments—without permission.</p>
			<p>By minimizing trust and removing infrastructure gateways, ContextVM creates a truly permissionless environment for computation.</p>`
		},
		{
			question: 'Is ContextVM open source?',
			answer: `<p>Yes. ContextVM is fully open source and community-driven. The protocol specification, SDKs, gateway, proxy, and tooling are all publicly available</p>
			<p>You can view, contribute to, or fork the code on GitHub: <a href="https://github.com/contextvm" target="_blank" rel="noopener noreferrer">github.com/contextvm</a></p>`
		},
		{
			question: 'Do I need an LLM to use ContextVM?',
			answer: `<p>No, you don't need an LLM to use ContextVM. While ContextVM is often used with LLMs through MCP (Model Context Protocol), it can be used independently by both humans and machines.</p>
			<p>MCP uses JSON-RPC messages for communication between clients and servers, making it versatile for various environments:</p>
			<p>An interesting aspect is that servers and capabilities use natural language to describe what they do. This makes them self-explanatory and understandable by both LLMs and humans, creating a bridge between the two worlds.</p>
			<p>In summary, ContextVM works indifferently with humans or LLMs—whichever you prefer!</p>
			<h3>Use Cases Beyond LLMs</h3>
			<ul>
				<li><strong>Custom interfaces for servers</strong>: Build web apps, desktop applications, or command-line tools that interact with ContextVM servers directly</li>
				<li><strong>Library-like implementations</strong>: Use the MCP server as a backend where your application acts as a client, making remote function calls as if they were local library functions</li>
				<li><strong>Collaborative workspaces</strong>: Create shared workspaces where team members can access and manipulate resources through ContextVM servers</li>
			</ul>`
		},
		{
			question: 'What happened to DVMCP?',
			answer: `<p>ContextVM is the evolution of the earlier project known as DVMCP. The rebrand was driven by:</p>
			<ul>
				<li><strong>Clarity</strong>: Avoiding confusion with similarly named projects like "Damn Vulnerable MCP"</li>
				<li><strong>Focus</strong>: Emphasizing its role as a context-aware transport layer, not a virtual machine</li>
				<li><strong>Technical evolution</strong>: Reflecting a more modular, MCP-compliant architecture</li>
				<li><strong>Governance</strong>: Signaling a shift to a community-governed, open standard</li>
			</ul>
			<p>The underlying vision—democratizing decentralized AI and general computation—remains unchanged.</p>`
		},
		{
			question: 'Does my MCP server need to be rewritten?',
			answer: `<p>No. ContextVM operates at the <strong>transport layer</strong>, so existing MCP servers and clients can be used <strong>without code changes</strong>.</p>
			<p>You can:</p>
			<ul>
				<li>Use the <strong>ContextVM Gateway</strong> to expose a standard MCP server over Nostr</li>
				<li>Use the <strong>ContextVM Proxy</strong> to let a standard MCP client access Nostr-hosted services</li>
			</ul>
			<p>These tools act as transparent bridges, translating between standard transports and Nostr transport.</p>`
		},
		{
			question: 'How do I deploy a service with ContextVM?',
			answer: `<p>Deploying a service is simple:</p>
			<h3>Deploying an existing MCP server:</h3>
			<ol>
				<li>Run the <strong>ContextVM Gateway</strong> alongside your existing MCP server</li>
				<li>Provide your private key, a list of Nostr relays, and the command to start your server</li>
				<li>Choose whether to publish a public announcement</li>
			</ol>
			<p>Example:</p>
			<pre><code>gateway-cli --private-key "your-key" --relays "wss://relay.nostr.org,wss://nos.lol" --server "python my-server.py" --public  # omit this flag for private servers</code></pre>
			<h3>Creating a MCP server with Nostr Transport:</h3>
			<ol>
				<li>Write the functionallity of your server, you can still using the MCP sdk</li>
				<li>Instead of using one of the transports of the MCP sdk use the <code>NostrServerTransport</code> from the <code>@ContextVM/sdk</code></li>
				<li>Run it</li>
			</ol>
			<p>Your service is instantly accessible—no public IP, DNS, or firewall configuration needed.</p>`
		},
		{
			question: "Public vs Private Servers: What's the difference?",
			answer: `<p>ContextVM supports two modes of service operation:</p>
			<table>
				<thead>
					<tr>
						<th>Feature</th>
						<th>Public Server</th>
						<th>Private Server</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><strong>Announcements</strong></td>
						<td>Published to relays</td>
						<td>Not published</td>
					</tr>
					<tr>
						<td><strong>Discovery</strong></td>
						<td>Discoverable via relay queries</td>
						<td>Only accessible via known public key</td>
					</tr>
					<tr>
						<td><strong>Access Control</strong></td>
						<td>Can be open or whitelisted</td>
						<td>Same—whitelisting supported</td>
					</tr>
					<tr>
						<td><strong>Payments</strong></td>
						<td>Optional</td>
						<td>Optional</td>
					</tr>
					<tr>
						<td><strong>Encryption & Security</strong></td>
						<td>Same (E2E encrypted)</td>
						<td>Same</td>
					</tr>
					<tr>
						<td><strong>Functionality</strong></td>
						<td>Fully equivalent</td>
						<td>Fully equivalent</td>
					</tr>
				</tbody>
			</table>
			<p>In short: <strong>private servers offer the same capabilities as public ones</strong>—they just don't broadcast their existence. This is ideal for personal, team, or closed-group use.</p>
			<blockquote>
				<p><strong>Example</strong>: Run an SSH wrapper as a private MCP server. Only you and your team can access it—securely from anywhere, no more hassle.</p>
			</blockquote>`
		},
		{
			question: 'High-Level Network Topology',
			answer: `<p>ContextVM communication flows through three main actors:</p>
			<pre><code>Client ⇄ Nostr Relay(s) ⇄ Server</code></pre>
			<p>Here's how they interact:</p>
			<ul>
				<li><strong>Client</strong>: Runs an MCP client (e.g., an AI agent). Uses the <strong>ContextVM Proxy</strong> or SDK to send encrypted requests via Nostr relays.</li>
				<li><strong>Relay(s)</strong>: Public or private WebSocket servers that route encrypted events. They act as <strong>intermediaries</strong>, not end points.</li>
				<li><strong>Server</strong>: Runs your service (e.g., a tool, script, or AI function). Uses the <strong>ContextVM Gateway</strong> or SDK to listen for incoming requests on relays.</li>
			</ul>
			<p><strong>Flow</strong>:</p>
			<ol>
				<li>Server (optional) publishes a signed service announcement to one or more relays</li>
				<li>Client discovers the service (if public) by querying relays—or knows the server's public key in advance (if private)</li>
				<li>Client sends an encrypted request to the server's public key via relays</li>
				<li>Server receives, decrypts, processes, and sends an encrypted response back</li>
				<li>All messages are signed and end-to-end encrypted</li>
			</ol>
			<p>This model lets you <strong>be your own infrastructure provider</strong>. No third-party hosts your code, controls access, or sits in the middle.</p>`
		},
		{
			question: 'How do clients find and connect to servers?',
			answer: `<ul>
				<li><strong>Public servers</strong>: Clients query Nostr relays for service announcements.</li>
				<li><strong>Private servers</strong>: Clients must know the server's <strong>Nostr public key (npub)</strong> in advance. No discovery—only direct connection.</li>
			</ul>
			<p>Once connected, the interaction is identical: secure, bidirectional, and encrypted.</p>`
		},
		{
			question: 'How does authentication work?',
			answer: `<p>Authentication is built into Nostr's public key cryptography:</p>
			<ul>
				<li>Every request is <strong>signed</strong> by the client's private key</li>
				<li>Servers verify the signature to confirm identity</li>
				<li>Server operators can:
					<ul>
						<li>Allow all signed requests (open access)</li>
						<li>Whitelist specific public keys (private access)</li>
						<li>Require payment before processing</li>
					</ul>
				</li>
			</ul>
			<p>This replaces OAuth, passwords, and API keys with a simpler, more secure model.</p>`
		},
		{
			question: 'Is communication secure?',
			answer: `<p>Yes. All client-server communication is <strong>end-to-end encrypted</strong> using Nostr's NIP-44 encryption standard. Messages are encrypted to the recipient's public key, so <strong>only the intended party can decrypt them</strong>.</p>
			<p>Even if a relay is compromised, attackers cannot:</p>
			<ul>
				<li>Read message content</li>
				<li>Impersonate sender or receiver</li>
				<li>Modify messages without detection</li>
			</ul>
			<p>This ensures confidentiality, integrity, and non-repudiation across untrusted networks.</p>`
		},
		{
			question: 'How are payments handled?',
			answer: `<p>Payments are <strong>optional</strong> and designed for creators who wish to monetize their services.</p>
			<ul>
				<li><strong>Supported</strong>: Bitcoin, especially via Lightning Network microtransactions</li>
				<li><strong>Mechanism</strong>: Servers can trigger Lightning invoice requests before fulfilling an operation</li>
				<li><strong>Validation</strong>: Servers validate the payment to unlock service access</li>
				<li><strong>Flexibility</strong>: Pricing models (per call, time-based, etc.) are configurable</li>
			</ul>`
		},
		{
			question: 'Do I need to be a developer to use ContextVM?',
			answer: `<p>Not necessarily. While developers can build and deploy servers using the SDK, <strong>end users</strong> can access ContextVM services through:</p>
			<ul>
				<li>Nostr-enabled apps</li>
				<li>MCP hosts or AI agents in platforms like Cursor, Claude, or other MCP-compatible tools</li>
			</ul>
			<p>All users need is:</p>
			<ul>
				<li>A Nostr identity (npub)</li>
				<li>An internet connection</li>
				<li>Optional: A Lightning wallet for paid services</li>
			</ul>`
		},
		{
			question: 'MCP Possibilities: Beyond AI Tools',
			answer: `<p>MCP is often associated with AI agent tooling—but it's <strong>much broader</strong>. MCP is a protocol for <strong>invoking remote functions</strong>, which means it can wrap <strong>any computational task</strong>, not just AI operations.</p>
			<p>With ContextVM, you can turn <strong>any script, process, or service</strong> into a secure, callable, and globally accessible API—and optionally monetize it.</p>
			<h3>Examples of General Computation Use Cases</h3>
			<ul>
				<li><strong>SSH Access Portal</strong>: Securely access remote machines via signed Nostr requests</li>
				<li><strong>Encryption as a Service</strong>: Offer file or text encryption via GPG in a sandboxed environment</li>
				<li><strong>Data Processing Engine</strong>: Validate, transform, or analyze data on demand</li>
				<li><strong>Code Sandbox</strong>: Execute untrusted code safely and return results</li>
				<li><strong>IoT Command Hub</strong>: Trigger physical actions (e.g., "turn on lights") from anywhere</li>
				<li><strong>Math & Simulation Engine</strong>: Run complex calculations or symbolic math remotely</li>
			</ul>
			<h3>Be Your Own Infrastructure Provider</h3>
			<p>With ContextVM, <strong>you are the infrastructure</strong>. There's no need to rent servers, configure cloud firewalls, or rely on SaaS platforms.</p>
			<p>Just:</p>
			<ol>
				<li>Write your logic</li>
				<li>Wrap it in an MCP server</li>
				<li>Deploy it using ContextVM</li>
			</ol>
			<p>You can run it on your laptop, Raspberry Pi, or old phone—and it's instantly reachable (or private). No DevOps, no ops.</p>
			<p>This empowers individuals and communities to <strong>reclaim control over computation</strong>, data, and value exchange.</p>`
		},
		{
			question: 'Comparison: Traditional Remote MCP vs ContextVM',
			answer: `<p>Deploying a remote MCP server the traditional way involves significant setup. ContextVM dramatically simplifies and secures this process.</p>
			<table>
				<thead>
					<tr>
						<th>Requirement</th>
						<th>Traditional Remote MCP (HTTP/SSE)</th>
						<th>ContextVM</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><strong>Domain Name</strong></td>
						<td>Required</td>
						<td>Not needed</td>
					</tr>
					<tr>
						<td><strong>DNS Configuration</strong></td>
						<td>Required</td>
						<td>Not needed</td>
					</tr>
					<tr>
						<td><strong>Public IP / Static IP</strong></td>
						<td>Required</td>
						<td>Not needed</td>
					</tr>
					<tr>
						<td><strong>Port Forwarding / Firewall</strong></td>
						<td>Required</td>
						<td>Not needed (outbound-only connection)</td>
					</tr>
					<tr>
						<td><strong>TLS Certificate (HTTPS)</strong></td>
						<td>Required</td>
						<td>Handled implicitly via Nostr encryption</td>
					</tr>
					<tr>
						<td><strong>Authentication</strong></td>
						<td>OAuth, API keys, or custom login</td>
						<td>Built-in: Nostr public key cryptography</td>
					</tr>
					<tr>
						<td><strong>Hosting Provider</strong></td>
						<td>Cloud VM, VPS, or dedicated server</td>
						<td>Any device with internet (laptop, Pi, phone)</td>
					</tr>
					<tr>
						<td><strong>Service Discovery</strong></td>
						<td>Centralized API directories or manual sharing</td>
						<td>Decentralized via Nostr relays (or private)</td>
					</tr>
					<tr>
						<td><strong>Payment Integration</strong></td>
						<td>Stripe, PayPal, or custom gateway</td>
						<td>Native Bitcoin & Lightning (optional)</td>
					</tr>
					<tr>
						<td><strong>Censorship Resistance</strong></td>
						<td>Low (depends on provider)</td>
						<td>High (no central point of control)</td>
					</tr>
				</tbody>
			</table>
			<blockquote>
				<p><strong>Example</strong>: Consider an SSH server. With standard MCP, you'd need a domain, static IP, DNS, TLS, and OAuth. With <strong>ContextVM</strong>, generate a private key, pick relays, run the gateway. It's instantly reachable—<strong>without exposing your network</strong>. Authentication? Your Nostr public key. Payment? Optional. No middlemen.</p>
				<p><strong>And you can keep it private</strong>: Just omit <code>--public</code>, share your public key with your team, and you have a secure, zero-config remote access solution.</p>
			</blockquote>`
		},
		{
			question: 'What is the ContextVM SDK?',
			answer: `<p>The <strong>ContextVM TypeScript SDK</strong> (<code>@contextvm/sdk</code>) enables native integration with the protocol. It includes:</p>
			<ul>
				<li><code>NostrServerTransport</code>: It allows an MCP server to expose its capabilities to the Nostr network, making them discoverable and usable by any Nostr-enabled client</li>
				<li><code>NostrClientTransport</code>: It enables MCP clients to communicate with remote MCP servers over the Nostr network.</li>
				<li>Built-in support for encryption, signing, relay management, and discovery</li>
			</ul>
			<p>With the SDK, you can build servers and clients that are <strong>born on Nostr</strong>, maximizing control, security, and performance.</p>`
		},
		{
			question: 'How does ContextVM handle scalability and reliability?',
			answer: `<p>Scalability is inherited from the Nostr ecosystem:</p>
			<ul>
				<li><strong>Redundancy</strong>: Servers can connect to multiple relays for high availability</li>
				<li><strong>Client Resilience</strong>: Clients can subscribe to many relays to ensure message delivery</li>
				<li><strong>Stateless Design</strong>: Requests are self-contained and verifiable</li>
				<li><strong>Decentralized Discovery</strong>: No single point of failure for service lookup</li>
			</ul>
			<p>Services can go offline and come back online without breaking references—only the current connection state matters.</p>`
		},
		{
			question: 'How can I get started?',
			answer: `<ol>
				<li><strong>Learn</strong>: Explore the full documentation at <a href="https://docs.contextvm.org" target="_blank" rel="noopener noreferrer">docs.contextvm.org</a></li>
				<li><strong>Deploy a Server</strong>:
					<pre><code>curl -fsSL https://raw.githubusercontent.com/contextvm/gateway-cli/main/install.sh | bash
gateway-cli --private-key "your-key" --relays "wss://relay.nostr.org" --server python my-mcp-server.py</code></pre>
					<p>(Omit <code>--public</code> for private servers)</p>
				</li>
				<li><strong>Connect a Client</strong>:
					<pre><code>curl -fsSL https://raw.githubusercontent.com/contextvm/proxy-cli/main/install.sh | bash
proxy-cli --private-key "your-key" --relays "wss://relay.nostr.org" --server-pubkey "npub1..."</code></pre>
				</li>
				<li><strong>Build</strong>: Use the TypeScript SDK for custom integrations: <a href="https://github.com/contextvm/ts-sdk" target="_blank" rel="noopener noreferrer">github.com/contextvm/ts-sdk</a></li>
				<li><strong>Engage</strong>: Follow us on Nostr or join community channels to contribute and stay updated.</li>
			</ol>`
		}
	];
</script>

<SEO
	title="FAQs"
	description="Find answers to common questions about ContextVM, the decentralized protocol for MCP servers on Nostr. Learn about how it works, security, payments, and getting started."
/>

{#snippet faqItem(faq: FAQ)}
	<Collapsible.Root>
		<Collapsible.Trigger
			class="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left shadow-sm hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
		>
			<div class="flex flex-col space-y-1">
				<h3 class="text-lg leading-none font-semibold tracking-tight">{faq.question}</h3>
			</div>
			<ChevronsUpDownIcon class="h-4 w-4" />
		</Collapsible.Trigger>
		<Collapsible.Content
			class="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 overflow-hidden"
		>
			<div
				class="prose prose-slate dark:prose-invert prose-sm sm:prose-base max-w-none border-t bg-muted/50 p-4 px-6"
			>
				{#if browser}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html DOMPurify.sanitize(faq.answer)}
				{/if}
			</div>
		</Collapsible.Content>
	</Collapsible.Root>
{/snippet}

<article class="container mx-auto max-w-4xl px-4 py-6 sm:py-8 md:py-12">
	<!-- FAQ header -->
	<header class="mb-6 sm:mb-8">
		<h1
			class="mb-3 text-2xl leading-tight font-bold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl"
		>
			Frequently Asked Questions
		</h1>
	</header>

	<!-- FAQ content -->
	<div class="space-y-4">
		{#each faqs as faq (faq.question)}
			{@render faqItem(faq)}
		{/each}
	</div>
</article>
