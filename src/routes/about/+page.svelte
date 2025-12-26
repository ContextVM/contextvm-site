<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import { browser } from '$app/environment';
	import Seo from '$lib/components/SEO.svelte';

	// About page content in markdown
	const aboutContent = `
Imagine a world where anyone, anywhere, can share their computational power and digital tools without asking permission. Where a developer in their garage can instantly offer services to users globally. Where communities can build and share resources without relying on tech giants.

ContextVM represents a fundamental shift in how we think about computation and infrastructure. We are not just building tools, we are building the foundation for a more equitable decentralized internet thanks to open protocols like Nostr, Bitcoin, MCP, and new paradigms like AI.

## The Problem: Walled Gardens Everywhere

Today's internet is dominated by gatekeepers. To create an online service, you must navigate domains, DNS, cloud hosting, OAuth, and payment processors—creating barriers at every turn. Even powerful new standards like the [Model Context Protocol](https://modelcontextprotocol.io) are being built on these same restrictive foundations, replicating the same gatekeeper models that dominate today's web.

This model stifles innovation, excludes creators, and concentrates power in the hands of tech giants. We believe there's a better way.

## What ContextVM Is

ContextVM is a protocol that liberates the Model Context Protocol by running it over [Nostr](https://nostr.com)—a simple, open communication network built on cryptographic, censorship-resistant, and permissionless foundations.

We don't replace MCP; we free it. By moving identity, discovery, connectivity, and payments into a decentralized fabric, ContextVM makes MCP truly permissionless and globally accessible.

## Democratizing Computation

We aim to remove the infrastructure barriers that concentrate power. ContextVM makes zero infrastructure deployment possible:

*   **Run from anywhere**: A laptop behind a firewall, a Raspberry Pi, or even a phone—no public IP, port forwarding, or complex networking
*   **Sovereign identity**: Replace centralized auth and API keys with Nostr keys you control
*   **Permissionless innovation**: Anyone can build, deploy, and earn without asking
*   **Direct value exchange**: Bitcoin micropayments connect creators directly with users
*   **Censorship-resistant infrastructure**: No central point of control or failure

## The Dual API Revolution

ContextVM presents a unique dual API that lets you write your server once and make it accessible to both humans and machines through one protocol. You can use it programmatically to build the backend of any application and consume it through a custom interface or web app, while the same service can be operated by LLMs without any changes because it is built on MCP, the first common language for large language models.

All the power from MCP is available out of the box as ContextVM plugs into the transport layer—AI compatibility, input and output schemas, rich primitives like tools, static resources, prompts, real-time communication, and bidirectional communication are all there. As MCP advances, ContextVM advances at the same pace. Build once, deploy everywhere.

## Real Impact, Real Freedom

**For the Community:** Build and share resources across many devices, forming a resilient network that no single failure can break.

**For the Innovator:** Launch a new service from your garage—no permission, no upfront hosting costs, and immediate reach.

**For anyone:** Run and use MCP servers from anywhere. You can access your own servers in a secure and private way, effectively becoming your own infrastructure.

## Built for Builders, Born from Community

ContextVM operates purely at the transport layer, so your MCP-compliant servers and clients can adopt it with zero code changes. Our open-source toolkit includes:

## Our Principles

ContextVM is completely [open source](https://github.com/contextvm) and community-driven. We believe in:

*   **Sovereignty**: Your keys, your identity, your rules
*   **Permissionless Innovation**: Anyone can build, deploy, and earn without asking
*   **Censorship Resistance**: No central point of control or failure
*   **Direct Value Exchange**: Value flows directly to creators, without intermediaries
*   **Transparency**: All code, specifications, and discussions are public and fully open source

## Join the Movement

As AI and automation reshape our world, the infrastructure that powers these systems is becoming increasingly centralized. ContextVM offers an alternative—infrastructure that cannot be censored, services that cannot be deplatformed, and value that flows directly to creators.

We are 100 percent open source and community governed. No venture capital, no exit strategy, no compromise on principles. Built for longevity, not for acquisition. Designed to be forked, modified, and owned by the community.

We are not asking for permission to build this future. We are building it.

No gates, no permission slips, just keys, cryptography, and a network that anyone can join.

To get involved:
*   Follow us on [Nostr](https://jumble.social/npub1dvmcpmefwtnn6dctsj3728n64xhrf06p9yude77echmrkgs5zmyqw33jdm)
*   Join our public [Signal channel](https://signal.group/#CjQKIOgvfFJf8ZFZ1SsMx7teFqNF73sZ9Elaj_v5i6RSjDHmEhAB3wO1Rg-0gLNdusnb3wLR)

---

*Built with ❤️ for the decentralized web*`;
</script>

<Seo
	title="About"
	description="ContextVM is more than technology—it's a movement. Discover how we're democratizing computation and building sovereign infrastructure for a permissionless future."
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
