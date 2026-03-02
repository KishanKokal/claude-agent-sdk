import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Options, Query, SDKUserMessage } from '@anthropic-ai/claude-agent-sdk';
import { loadEsm } from 'load-esm';
import { SDKMessage } from '../interfaces/sdk-message';
import { prettyPrintMessage } from 'src/utils/pretty-print-message';
import { mkdir } from 'node:fs/promises';
import * as path from 'node:path';

@Injectable()
export class GettingStartedService implements OnModuleInit {
  private logger = new Logger(GettingStartedService.name);
  private staticSessionId: string = '';
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
    this.logger.log(`🚀 sessionId: ${this.staticSessionId}`);
    const result: Query = this.query({
      prompt,
      options: {
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
        },
        model: 'claude-sonnet-4-6',
        // for continuing the session
        resume:
          this.staticSessionId.length > 0 ? this.staticSessionId : undefined,
        permissionMode: 'bypassPermissions',
      },
    });

    for await (const message of result as AsyncIterable<SDKMessage>) {
      if (this.staticSessionId.length === 0)
        this.staticSessionId = message.session_id;
      prettyPrintMessage(message, this.logger);
    }
  }

  async basicStockAnalysis() {
    // get the current working directory
    const cwd = process.cwd();

    // ensure tmp directory exists
    const tmpDir = path.join(cwd, 'tmp');
    await mkdir(tmpDir, { recursive: true });

    // get the absolute path to the tmp directory
    const tmpPath = path.resolve(tmpDir);

    this.logger.log(`Working directory: ${cwd}`);
    this.logger.log(`Temp directory: ${tmpPath}`);

    const options: Options = {
      // Allow code generation and execution tools
      allowedTools: ['Read', 'Write', 'Bash'],

      // Auto-approve tool usage for smooth demo
      // In production, use permission_mode="default" with approval callbacks
      permissionMode: 'bypassPermissions',

      // Use Claude Sonnet for cost-effectiveness
      model: 'claude-sonnet-4-6',

      // Limit turns to prevent runaway execution
      // maxTurns: 10,

      // Set working directory to current directory
      cwd: cwd,

      // Custom system prompt to guide agent
      systemPrompt: `You are a financial analysis assistant. You have access to Read, Write an Bash tools.
      
IMPORTANT INSTRUCTIONS:
1. **Package Management**: This project uses uv for Python package management
   - To run Python scripts, use: "uv run python script.py"
   - All required packages (yfinance, pandas, matplotlib, etc.) are pre-installed
   - DO NOT use pip install - packages are already available via uv

2. **File Storage**: Save ALL generated files to this specific directory: {tmp_path}
   - Use ABSOLUTE PATHS when writing files
   - Example: Write scripts to ${tmpPath}/analysis.py
   - Example: Save data to ${tmpPath}/stock_data.csv
   - Example: Save results to ${tmpPath}/analysis_results.json
   - DO NOT use /tmp or any other temp directory

3. **Workflow**: 
   - Write Python scripts with full path: ${tmpPath}/script_name.py
   - Execute with "uv run python ${tmpPath}/script_name.py"
   - Read results from ${tmpPath}/result_file.json

Write clean, well-commented Python code for financial analysis tasks.
      `,
    };

    const prompt = `
Analyze Apple (AAPL) stock performance over the last 3 months.
    
Write Python code using yfinance to:
1. Fetch the stock data
2. Calculate basic statistics (mean price, volatility, return)
3. Save the results to a JSON file
    
Remember: Use the absolute path ${tmpPath} for all files.

Then analyze the results and provide insights.`;

    const result = this.query({
      prompt,
      options,
    });

    for await (const message of result as AsyncIterable<SDKMessage>) {
      prettyPrintMessage(message, this.logger);
    }
  }
}
