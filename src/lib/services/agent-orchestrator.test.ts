import { describe, expect, it, mock } from 'bun:test';
import { AgentOrchestrator } from './agent-orchestrator';
import {
	PAYMENT_PENDING_ERROR_CODE,
	PAYMENT_REQUIRED_ERROR_CODE
} from './payments/payment-errors';
import type { LLMService, SendMessageResult } from './llm';
import type { McpClientService } from './mcpClient.svelte';
import type { ChatMessage } from '$lib/types/chat-types';

describe('AgentOrchestrator explicit gating', () => {
	it('handles -32042 payment_required by setting status and serializing losslessly', async () => {
		const mockData = {
			instructions: 'Pay to continue',
			payment_options: [{ pmi: 'bitcoin-lightning-bolt11', amount: 21, pay_req: 'lnbc...' }]
		};
		const mockError = Object.assign(new Error('Payment Required'), {
			code: PAYMENT_REQUIRED_ERROR_CODE,
			data: mockData
		});

		const mcpClientService = {
			clients: new Map([['test_server', { 
				getServerVersion: () => ({ name: 'test', version: '1' }),
				listTools: async () => ({ tools: [{ name: 'test_tool', inputSchema: { type: 'object', properties: {} } }] })
			}]]),
			listTools: mock(async () => ({
				tools: [
					{
						name: 'test_tool',
						inputSchema: { type: 'object', properties: {} }
					}
				]
			})),
			callTool: mock(async () => {
				throw mockError;
			})
		} as unknown as McpClientService;

		const llmService: LLMService = {
			sendMessage: mock(async (messages: ChatMessage[]) => {
				// If we have a tool result, return stop
				const hasToolResult = messages.some((m) => m.role === 'tool');
				if (hasToolResult) {
					return { content: 'Acknowledged', finishReason: 'stop' } as SendMessageResult;
				}

				return {
					content: '',
					finishReason: 'tool_calls',
					model: 'test',
					toolCalls: [
						{
							id: 'call_1',
							functionName: 'test_test_tool',
							arguments: '{}'
						}
					]
				} as SendMessageResult;
			})
		} as unknown as LLMService;

		const orchestrator = new AgentOrchestrator({ llmService, mcpClientService });

		const initialMessages: ChatMessage[] = [{ id: 'msg1', role: 'user', content: 'Do it', timestamp: new Date() }];

		const runPromise = orchestrator.run({
			messages: initialMessages,
			signal: new AbortController().signal
		});

		await new Promise(resolve => setTimeout(resolve, 10));
		orchestrator.approveToolCall('call_1');

		await runPromise;

		// We should have: User -> Assistant (tool_calls) -> Tool (payment_required result) -> Assistant (Acknowledged)
		expect(initialMessages.length).toBe(4);

		const assistantMessage = initialMessages[1];
		expect(assistantMessage.role).toBe('assistant');
		expect(assistantMessage.toolCalls).toBeDefined();

		const toolCall = assistantMessage.toolCalls![0];
		expect(toolCall.status).toBe('payment_required');
		expect(toolCall.paymentError).toEqual({
			code: PAYMENT_REQUIRED_ERROR_CODE,
			message: 'Payment Required',
			data: mockData
		});

		const toolMessage = initialMessages[2];
		expect(toolMessage.role).toBe('tool');
		expect(toolMessage.content).toBe(
			JSON.stringify({
				code: PAYMENT_REQUIRED_ERROR_CODE,
				message: 'Payment Required',
				data: mockData
			})
		);
	});

	it('handles -32043 payment_pending by setting status and serializing losslessly', async () => {
		const mockData = { retry_after: 2 };
		const mockError = Object.assign(new Error('Payment Pending'), {
			code: PAYMENT_PENDING_ERROR_CODE,
			data: mockData
		});

		const mcpClientService = {
			clients: new Map([['test_server', { 
				getServerVersion: () => ({ name: 'test', version: '1' }),
				listTools: async () => ({ tools: [{ name: 'test_tool', inputSchema: { type: 'object', properties: {} } }] })
			}]]),
			listTools: mock(async () => ({
				tools: [
					{
						name: 'test_tool',
						inputSchema: { type: 'object', properties: {} }
					}
				]
			})),
			callTool: mock(async () => {
				throw mockError;
			})
		} as unknown as McpClientService;

		const llmService: LLMService = {
			sendMessage: mock(async (messages: ChatMessage[]) => {
				const hasToolResult = messages.some((m) => m.role === 'tool');
				if (hasToolResult) {
					return { content: 'Acknowledged', finishReason: 'stop' } as SendMessageResult;
				}

				return {
					content: '',
					finishReason: 'tool_calls',
					model: 'test',
					toolCalls: [
						{
							id: 'call_1',
							functionName: 'test_test_tool',
							arguments: '{}'
						}
					]
				} as SendMessageResult;
			})
		} as unknown as LLMService;

		const orchestrator = new AgentOrchestrator({ llmService, mcpClientService });
		const initialMessages: ChatMessage[] = [{ id: 'msg1', role: 'user', content: 'Do it', timestamp: new Date() }];
		
		const runPromise = orchestrator.run({
			messages: initialMessages,
			signal: new AbortController().signal
		});

		await new Promise(resolve => setTimeout(resolve, 10));
		orchestrator.approveToolCall('call_1');

		await runPromise;

		const assistantMessage = initialMessages[1];
		const toolCall = assistantMessage.toolCalls![0];
		
		expect(toolCall.status).toBe('payment_required');
		expect(toolCall.paymentError).toEqual({
			code: PAYMENT_PENDING_ERROR_CODE,
			message: 'Payment Pending',
			data: mockData
		});
	});

	it('leaves status as error for non-payment errors', async () => {
		const mockError = new Error('Network timeout');

		const mcpClientService = {
			clients: new Map([['test_server', { 
				getServerVersion: () => ({ name: 'test', version: '1' }),
				listTools: async () => ({ tools: [{ name: 'test_tool', inputSchema: { type: 'object', properties: {} } }] })
			}]]),
			listTools: mock(async () => ({
				tools: [
					{
						name: 'test_tool',
						inputSchema: { type: 'object', properties: {} }
					}
				]
			})),
			callTool: mock(async () => {
				throw mockError;
			})
		} as unknown as McpClientService;

		const llmService: LLMService = {
			sendMessage: mock(async (messages: ChatMessage[]) => {
				const hasToolResult = messages.some((m) => m.role === 'tool');
				if (hasToolResult) {
					return { content: 'Acknowledged', finishReason: 'stop' } as SendMessageResult;
				}

				return {
					content: '',
					finishReason: 'tool_calls',
					model: 'test',
					toolCalls: [
						{
							id: 'call_1',
							functionName: 'test_test_tool',
							arguments: '{}'
						}
					]
				} as SendMessageResult;
			})
		} as unknown as LLMService;

		const orchestrator = new AgentOrchestrator({ llmService, mcpClientService });
		const initialMessages: ChatMessage[] = [{ id: 'msg1', role: 'user', content: 'Do it', timestamp: new Date() }];
		
		const runPromise = orchestrator.run({
			messages: initialMessages,
			signal: new AbortController().signal
		});

		await new Promise(resolve => setTimeout(resolve, 10));
		orchestrator.approveToolCall('call_1');

		await runPromise;

		const assistantMessage = initialMessages[1];
		const toolCall = assistantMessage.toolCalls![0];
		
		expect(toolCall.status).toBe('error');
		expect(toolCall.paymentError).toBeUndefined();
	});
});
