import {
  SDKUserMessage,
  Query,
  Options,
  PreToolUseHookInput,
  HookCallback,
} from '@anthropic-ai/claude-agent-sdk';
import { SDKMessage } from '../interfaces/sdk-message';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BashInput } from 'src/interfaces/bash-input';
import { prettyPrintMessage } from 'src/utils/pretty-print-message';
import { loadEsm } from 'load-esm';

/*
Why Hooks?
Hooks let you intercept agent execution at key points to:
-> Block dangerous operations before they execute (like rm -rf / or unauthorized file access)
-> Log and audit every tool call for compliance, debugging, or analytics
-> Transform inputs and outputs to sanitize data, inject credentials, or redirect paths
-> Require human approval for sensitive actions like database writes or API calls
-> Track session lifestyle to manage state, clean up resources, or send notifications

Hook Structure:
A hook has two parts:
-> The callback function: The logic that runs when the hook fires
-> The hook configuration: Tells the SDK which event to hook into (like PreToolUse) and which tools to match
*/

@Injectable()
export class HooksService implements OnModuleInit {
  private logger = new Logger(HooksService.name);
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

  private blockLsCommandHook: HookCallback = async (
    input: PreToolUseHookInput,
  ) => {
    this.logger.log(`
HOOK FIRED: ${input.hook_event_name}
Tool Name: ${input.tool_name}
Tool Use ID: ${input.tool_use_id}
Tool Input:
${JSON.stringify(input.tool_input, null, 2)}
`);
    const command = (input.tool_input as BashInput).command;

    if (command.trim().startsWith('ls')) {
      this.logger.log(`\nDECISION: BLOCK THIS COMMAND\nPreToolUse: DENIED`);
      return Promise.resolve({
        hookSpecificOutput: {
          hookEventName: input.hook_event_name,
          permissionDecision: 'deny',
          permissionDecisionReason:
            'ls commands are blocked by security policy',
        },
      });
    }

    this.logger.log(`\nDECISION: ALLOW THIS COMMAND\nPreToolUse: ALLOWED`);

    return Promise.resolve({});
  };

  async testBlockLsCommand() {
    // get the current working directory
    const cwd = process.cwd();
    const result: Query = this.query({
      prompt: `Run this bash command: ls -la`,
      options: {
        hooks: {
          PreToolUse: [{ matcher: 'Bash', hooks: [this.blockLsCommandHook] }],
        },
        model: 'claude-sonnet-4-6',
        permissionMode: 'bypassPermissions',
        cwd,
      },
    });

    for await (const message of result as AsyncIterable<SDKMessage>) {
      prettyPrintMessage(message, this.logger);
    }
  }
}
