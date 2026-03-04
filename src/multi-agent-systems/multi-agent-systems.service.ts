import { Options, Query, SDKUserMessage } from '@anthropic-ai/claude-agent-sdk';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { loadEsm } from 'load-esm';
import { SDKMessage } from 'src/interfaces/sdk-message';
import { prettyPrintMessage } from 'src/utils/pretty-print-message';

@Injectable()
export class MultiAgentSystemsService implements OnModuleInit {
  private logger = new Logger(MultiAgentSystemsService.name);
  private query: (_params: {
    prompt: string | AsyncIterable<SDKUserMessage>;
    options?: Options;
  }) => Query;

  constructor() {}

  async onModuleInit() {
    const { query } = await loadEsm<
      typeof import('@anthropic-ai/claude-agent-sdk')
    >('@anthropic-ai/claude-agent-sdk');

    this.query = query;
  }

  async writeBlog() {
    // get the current working directory
    const cwd = process.cwd();
    const result: Query = this.query({
      prompt: `Write a 400-word blog post about 3P Consultants Pvt. Ltd. 

IMPORTANT: Follow this sequence:
1. First, use the researcher agent to gather facts and statistics
2. Wait for the researcher to complete and return results
3. Then, use the writer agent to create the blog post based on the research

Do NOT invoke the writer until research is complete.`,
      options: {
        allowedTools: ['Task'],
        model: 'claude-sonnet-4-6',
        permissionMode: 'bypassPermissions',
        cwd,
        agents: {
          researcher: {
            description: `Research specialist. Use this agent to gather facts, statistics, and examples about any topic using web search.`,
            prompt: `You are a research specialist. Your job is to:
1. Search the web for current information on the given topic
2. Identify key themes and important facts
3. Gather relevant examples and statistics
4. Organize findings clearly
5. Return a concise research summary

Use WebSearch to find information.`,
            tools: ['WebSearch', 'WebFetch'],
            model: 'sonnet',
          },
          writer: {
            description:
              'Content writer. Use this agent to write blog posts, articles, and other content based on research or information provided.',
            prompt: `You are a professional blog writer. Create engaging content with:
- Strong opening hook
- Clear structure (intro, body, conclusion)
- Conversational and accessible tone
- Specific examples and details
- Easy readability

Write based on the research provided to you. Save your blog post to a file.`,
            tools: ['Write'],
            model: 'sonnet',
          },
        },
      },
    });

    for await (const message of result as AsyncIterable<SDKMessage>) {
      prettyPrintMessage(message, this.logger);
    }
  }
}
