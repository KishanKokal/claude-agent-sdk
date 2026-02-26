import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Options, Query, SDKUserMessage } from '@anthropic-ai/claude-agent-sdk';
import { loadEsm } from 'load-esm';
import { SDKMessage } from '../interfaces/sdk-message';
import { prettyPrintMessage } from 'src/utils/pretty-print-message';

@Injectable()
export class GettingStartedService implements OnModuleInit {
  private logger = new Logger(GettingStartedService.name);

  private query: (_params: {
    prompt: string | AsyncIterable<SDKUserMessage>;
    options?: Options;
  }) => Query;

  async onModuleInit() {
    const { query } = await loadEsm<
      typeof import('@anthropic-ai/claude-agent-sdk')
    >('@anthropic-ai/claude-agent-sdk');

    this.query = query;
  }

  constructor() {}

  async yourFirstAgent(prompt: string) {
    const result: Query = this.query({
      prompt,
      options: {
        model: 'claude-sonnet-4-6',
      },
    });

    for await (const message of result as AsyncIterable<SDKMessage>) {
      prettyPrintMessage(message, this.logger);
      //   this.logger.log(message);
    }
  }
}
