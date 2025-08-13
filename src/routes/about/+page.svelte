<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import { browser } from '$app/environment';
	import Seo from '$lib/components/SEO.svelte';

	// About page content in markdown
	const aboutContent = `
Imagine a world where anyone, anywhere, can share their computational power and digital tools without asking permission. Where a developer in their garage can instantly offer services to users globally. Where communities can build and share resources without relying on tech giants.

This is the world ContextVM is building.

## The Problem We're Solving

Today's internet is dominated by walled gardens. To share a tool or service online, you need to navigate a maze of domain names, complex server setups, corporate payment processors, and permission from gatekeepers. Even powerful new standards like the [Model Context Protocol](https://modelcontextprotocol.io) are being built on these same restrictive foundations, tying them to the old centralized web—OAuth, centralized registries that decide who can participate, and traditional payment systems that exclude most of the world.

This model stifles innovation, excludes creators, and limits access for the majority of the world. We believe there's a better way.

## What ContextVM Is

ContextVM liberates MCP by running it over [Nostr](https://nostr.com)—a simple, open communication network built on strong cryptographic foundations, .

We don't replace MCP; we free it. By moving identity, discovery, connectivity, and payments into a decentralized, permissionless, and censorship resistant fabric, ContextVM makes MCP truly permissionless and globally accessible.

## How It Works

With ContextVM, running a service is as simple as running an app on your laptop. Your device doesn't need a public IP address, open ports, or complex networking. It just connects to Nostr relays, and your service is instantly accessible to anyone in the world.

*   **Your keys, your identity**: No OAuth, no accounts—just cryptographic keys you control.
*   **Run from anywhere**: A laptop behind a firewall, a Raspberry Pi, or even a phone can host an MCP server over Nostr.
*   **Open discovery**: Services announce themselves on public relays—no gatekeepers, no central app stores, and no single point of failure.
*   **Built-in security**: Every message is signed and encrypted by default.
*   **Native micropayments**: Direct Bitcoin/Lightning payments enable per-use pricing without intermediaries.

## Real Impact, Real Freedom

**For the Community:** Build and share resources across many devices, forming a resilient network that no single failure can break.

**For the Innovator:** Launch a new service from your garage—no permission, no upfront hosting costs, and immediate reach.

**For anyone:** Run and use MCP servers from anywhere. You can access your own servers in a secure and private way, effectively becoming your own infrastructure.

## Built for Builders

ContextVM provides a specification and a toolkit for innovation, designed to integrate seamlessly with existing tools. Because it operates purely at the transport layer, your MCP-compliant servers and clients can adopt it with zero code changes.

Our open-source toolkit includes:
*   **[Specification](https://docs.contextvm.org)**: Defines the ContextVM protocol, ensuring it can be independently implemented and remain interoperable.
*   **[TypeScript SDK](https://github.com/contextvm)**: A set of drop-in transports, modules, and helpers for building applications.
*   **[Gateway](https://github.com/contextvm)**: Makes any existing MCP server instantly accessible over Nostr.
*   **[Proxy](https://github.com/contextvm)**: Allows any existing MCP client to connect to services on the Nostr network.

The beauty is that existing MCP tools don't need to be rewritten. They gain all the benefits of Nostr instantly.

## Our Principles

ContextVM is completely [open source](https://github.com/contextvm) and community-driven. We believe in:

*   **Sovereignty**: Your keys, your identity, your rules.
*   **Permissionless Innovation**: Anyone can build, deploy, and earn without asking.
*   **Censorship Resistance**: No central point of control or failure.
*   **Direct Value Exchange**: Creators connect directly with users; value flows without intermediaries.

## Our Vision

We are setting the bases for a new computational commons—a sovereign, resilient, and open marketplace of tools and capabilities. We believe in a world where the right to compute is as fundamental as the right to speak, where value flows directly to creators, and where innovation is truly permissionless.

ContextVM is an invitation to build beyond the walled gardens. The tools are ready, the protocol is open, and the frontier is waiting.

## Join the Movement

Whether you're a developer wanting to share your tools, a community looking to build together, or simply someone who believes the internet should be free and open, ContextVM is for you.

No gates. No permission slips. Just keys, cryptography, and a network that anyone can join.

To get involved:
*   Follow us on [Nostr](https://njump.me/npub1dvmcpmefwtnn6dctsj3728n64xhrf06p9yude77echmrkgs5zmyqw33jdm)
*   Join our public [Signal channel](https://signal.group/#CjQKIOgvfFJf8ZFZ1SsMx7teFqNF73sZ9Elaj_v5i6RSjDHmEhAB3wO1Rg-0gLNdusnb3wLR)

---

*Built with ❤️ for the decentralized web*`;
</script>

<Seo
	title="About"
	description="Discover what ContextVM is, how it works, and how to get involved."
/>

<article class="container mx-auto max-w-4xl px-4 py-6 sm:py-8 md:py-12">
	<!-- About page header -->
	<header class="mb-6 sm:mb-8">
		<h1
			class="mb-3 text-2xl leading-tight font-bold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl"
		>
			About ContextVM
		</h1>
	</header>

	<!-- About page content -->
	<div
		class="prose prose-slate dark:prose-invert prose-sm sm:prose-base max-w-none [&>*:not(:first-child)]:mt-6"
	>
		{#await marked.parse(aboutContent) then html}
			{#if browser}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html DOMPurify.sanitize(html)}
			{/if}
		{/await}
	</div>
</article>
