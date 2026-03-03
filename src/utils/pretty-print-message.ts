import { Logger } from '@nestjs/common';
import { SDKMessage } from '../interfaces/sdk-message';
import Anthropic from '@anthropic-ai/sdk';

export interface Todo {
  status: 'completed' | 'pending' | 'in_progress';
  content: string;
}

export const prettyPrintMessage = (message: SDKMessage, logger: Logger) => {
  switch (message.type) {
    case 'system':
      if (message.subtype === 'init') {
        const sessionId = message.session_id;
        logger.log(`\n🔁 Session initialised: ${sessionId}`);
        return sessionId;
      }
      break;
    case 'assistant':
      for (const content of (message.message as Anthropic.Message).content) {
        if (content.type === 'text') {
          logger.log(`\n🤖 Assistant: ${content.text}`);
        } else if (content.type === 'tool_use') {
          if (content.name === 'TodoWrite') {
            let todosText = '';
            const todos = (content.input as { todos: Todo[] }).todos;
            todos.forEach((todo, index) => {
              const status =
                todo.status === 'completed'
                  ? '✅'
                  : todo.status === 'in_progress'
                    ? '🔧'
                    : '❌';
              todosText += `\n${index + 1}. ${status} ${todo.content}`;
            });
            logger.log(todosText);
          } else if (content.input) {
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
      if (message.tool_use_result) {
        logger.log(
          `\n📤 Tool Result: ${JSON.stringify(message.tool_use_result, null, 2)}`,
        );
      }
      break;
    case 'result':
      logger.log(
        `\n 💰 Cost: ${message.total_cost_usd} | ⏱️ Time: ${message.duration_ms / 1000}s`,
      );
      break;
  }
};
