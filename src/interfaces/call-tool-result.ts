export interface CallToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}
