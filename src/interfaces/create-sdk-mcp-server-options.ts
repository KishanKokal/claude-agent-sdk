import { SdkMcpToolDefinition } from '@anthropic-ai/claude-agent-sdk';

export interface CreateSdkMcpServerOptions {
  name: string;
  version?: string;
  tools?: Array<SdkMcpToolDefinition<any>>;
}
