import {
  SDKAssistantMessage,
  SDKUserMessage,
  SDKUserMessageReplay,
  SDKResultMessage,
  SDKSystemMessage,
  SDKPartialAssistantMessage,
  SDKCompactBoundaryMessage,
  SDKStatusMessage,
  SDKHookStartedMessage,
  SDKHookProgressMessage,
  SDKHookResponseMessage,
  SDKToolProgressMessage,
  SDKAuthStatusMessage,
  SDKTaskNotificationMessage,
  SDKTaskStartedMessage,
  SDKTaskProgressMessage,
  SDKFilesPersistedEvent,
  SDKToolUseSummaryMessage,
} from '@anthropic-ai/claude-agent-sdk';

export type SDKMessage =
  | SDKAssistantMessage
  | SDKUserMessage
  | SDKUserMessageReplay
  | SDKResultMessage
  | SDKSystemMessage
  | SDKPartialAssistantMessage
  | SDKCompactBoundaryMessage
  | SDKStatusMessage
  | SDKHookStartedMessage
  | SDKHookProgressMessage
  | SDKHookResponseMessage
  | SDKToolProgressMessage
  | SDKAuthStatusMessage
  | SDKTaskNotificationMessage
  | SDKTaskStartedMessage
  | SDKTaskProgressMessage
  | SDKFilesPersistedEvent
  | SDKToolUseSummaryMessage;
