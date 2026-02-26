import { Logger } from '@nestjs/common';
import { SDKMessage } from '../interfaces/sdk-message';
import Anthropic from '@anthropic-ai/sdk';

export const prettyPrintMessage = (message: SDKMessage, logger: Logger) => {
  switch (message.type) {
    case 'system':
      break;
    case 'assistant':
      for (const content of (message.message as Anthropic.Message).content) {
        if (content.type === 'text') {
          logger.log(`\n🤖 Assistant: ${content.text}`);
        } else if (content.type === 'tool_use') {
          if (content.input) {
            // Show other arguments (excluding description)
            const args = content.input;
            if (args) {
              logger.log(
                `\n🔧 Tool: ${content.name}\n   ➡️  ${JSON.stringify(args, null, 2)}`,
              );
            }
          }
        }
      }
      break;
    case 'user':
      for (const content of (message.message as Anthropic.Message).content) {
        if (
          content.type === 'bash_code_execution_tool_result' ||
          content.type === 'code_execution_tool_result' ||
          content.type === 'text_editor_code_execution_tool_result' ||
          content.type === 'tool_search_tool_result' ||
          content.type === 'web_fetch_tool_result' ||
          content.type === 'web_search_tool_result'
        ) {
          logger.log(content.content);
        }
      }
      break;
    case 'result':
      logger.log(
        `\n 💰 Cost: ${message.total_cost_usd} | ⏱️ Time: ${message.duration_ms / 1000}s`,
      );
  }
};
