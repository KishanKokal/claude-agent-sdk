import {
  Options,
  Query,
  SDKUserMessage,
  McpSdkServerConfigWithInstance,
  InferShape,
  SdkMcpToolDefinition,
} from '@anthropic-ai/claude-agent-sdk';
import { Injectable, Logger } from '@nestjs/common';
import { loadEsm } from 'load-esm';
import { z } from 'zod';
import { HttpService } from '@nestjs/axios';
import { WeatherApiResponse } from 'src/interfaces/weather-api-response';
import { SDKMessage } from 'src/interfaces/sdk-message';
import { prettyPrintMessage } from 'src/utils/pretty-print-message';
import { CreateSdkMcpServerOptions } from 'src/interfaces/create-sdk-mcp-server-options';
import { CallToolResult } from 'src/interfaces/call-tool-result';
import { ToolAnnotations } from 'src/interfaces/tool-annotations';

/*
What are custom tools?

Custom tools allow you to extend Claude's capabilities by:
-> Connecting to external APIs (weather, databases, payment systems)
-> Adding domain-specific functionality (calculations, data transformations)
-> Integrating with your services (internal APIs, microservices)

How It Works
-> Define tools using the `tool` method
-> Create an MCP server with createSdkMcpServer()
-> Pass the server to query via `mcpServers` parameter
-> Control which tools are available via `allowedTools`

Tool Name Format
When exposed to Claude, tool names follow this pattern:

mcp__{server_name}__{tool_name}

Example: get_weather in server my-tools becomes mcp__my-tools__get_weather
 */

@Injectable()
export class CustomToolsService {
  private logger = new Logger(CustomToolsService.name);
  private query: (_params: {
    prompt: string | AsyncIterable<SDKUserMessage>;
    options?: Options;
  }) => Query;
  private createSdkMcpServer: (
    _options: CreateSdkMcpServerOptions,
  ) => McpSdkServerConfigWithInstance;
  private tool: <
    Schema extends Readonly<{
      [k: string]: z.core.$ZodType<
        unknown,
        unknown,
        z.core.$ZodTypeInternals<unknown, unknown>
      >;
    }>,
  >(
    _name: string,
    _description: string,
    _inputSchema: Schema,
    _handler: (
      args: InferShape<Schema>,
      extra: unknown,
    ) => Promise<CallToolResult>,
    _extras?: {
      annotations?: ToolAnnotations;
    },
  ) => SdkMcpToolDefinition<Schema>;

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    const { query, createSdkMcpServer, tool } = await loadEsm<
      typeof import('@anthropic-ai/claude-agent-sdk')
    >('@anthropic-ai/claude-agent-sdk');

    this.query = query;
    this.createSdkMcpServer = createSdkMcpServer;
    this.tool = tool;
  }

  async useWeatherTool() {
    const getWeather = this.tool(
      'get_weather',
      'Get current temperature for a location using coordinates',
      {
        latitude: z.float32(),
        longitude: z.float32(),
      },
      async ({ latitude, longitude }) => {
        try {
          const { data } =
            await this.httpService.axiosRef.get<WeatherApiResponse>(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&temperature_unit=celsius`,
            );
          return {
            content: [
              {
                type: 'text',
                text: `Temperature: ${data.current.temperature_2m}°C`,
              },
            ],
          };
        } catch (e) {
          return {
            content: [
              {
                type: 'text',
                text: `An error occured while fetching the temperature ${JSON.stringify(e)}`,
              },
            ],
          };
        }
      },
    );

    const weatherMcpServer = this.createSdkMcpServer({
      name: 'weather',
      version: '1.0.0',
      tools: [getWeather],
    });

    const cwd = process.cwd();
    const result: Query = this.query({
      prompt: `What is the weather like today in Mumbai?`,
      options: {
        model: 'claude-sonnet-4-6',
        permissionMode: 'bypassPermissions',
        cwd,
        mcpServers: { email: weatherMcpServer },
        allowedTools: ['mcp__weather-tools__get_weather'],
      },
    });

    for await (const message of result as AsyncIterable<SDKMessage>) {
      prettyPrintMessage(message, this.logger);
    }
  }

  async calculator() {
    const calculateBinaryOperations = this.tool(
      'calculate_binary_operations',
      'Perform mathematical binary calculations',
      {
        numberA: z.number(),
        operation: z.enum([
          'min',
          'max',
          'addition',
          'subtraction',
          'division',
          'power',
        ]),
        numberB: z.number(),
      },
      ({ numberA, operation, numberB }) => {
        let result: number;

        switch (operation) {
          case 'addition':
            result = numberA + numberB;
            break;
          case 'subtraction':
            result = numberA - numberB;
            break;
          case 'min':
            result = Math.min(numberA, numberB);
            break;
          case 'max':
            result = Math.max(numberA, numberB);
            break;
          case 'power':
            result = Math.pow(numberA, numberB);
            break;
          case 'division':
            result = numberA / numberB;
            break;
        }

        return Promise.resolve({
          content: [
            {
              type: 'text',
              text: result.toString(),
            },
          ],
        });
      },
    );

    const calculateUnaryOperations = this.tool(
      'calculate_unary_operations',
      'Perform mathematical unary calculations',
      {
        number: z.number(),
        operation: z.enum(['abs', 'round', 'sqrt']),
      },
      ({ number, operation }) => {
        let result: number;

        switch (operation) {
          case 'abs':
            result = Math.abs(number);
            break;
          case 'round':
            result = Math.round(number);
            break;
          case 'sqrt':
            result = Math.sqrt(number);
            break;
        }

        return Promise.resolve({
          content: [
            {
              type: 'text',
              text: result.toString(),
            },
          ],
        });
      },
    );

    const compoundInterest = this.tool(
      'compound_interest',
      'Calculate compound interest for an investment',
      {
        principal: z.float32(),
        rate: z.float32(),
        time: z.float32(),
        n: z.float32(),
      },
      ({ principal, rate, time, n = 12 }) => {
        const amount = principal * Math.pow(1 + rate / n, n * time);
        const interest = amount - principal;
        const returnPercent = (interest / principal) * 100;

        const result = `Investment Analysis:
Principal: $${principal.toFixed(2)}
Rate: ${(rate * 100).toFixed(2)}%
Time: ${time.toFixed(2)} years
Compounding: ${n} times per year

Final Amount: $${amount.toFixed(2)}
Interest Earned: $${interest.toFixed(2)}
Return: ${returnPercent.toFixed(2)}%`;

        return Promise.resolve({
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        });
      },
    );

    const mathMcpServer = this.createSdkMcpServer({
      name: 'math',
      version: '1.0.0',
      tools: [
        calculateBinaryOperations,
        calculateUnaryOperations,
        compoundInterest,
      ],
    });

    const cwd = process.cwd();
    const result: Query = this.query({
      prompt: `Calculate sqrt(144) + 25^2, and tell me how much $10,000 grows to at 5% annual interest over 10 years with monthly compounding`,
      options: {
        model: 'claude-sonnet-4-6',
        permissionMode: 'bypassPermissions',
        cwd,
        mcpServers: { math: mathMcpServer },
        allowedTools: [
          'mcp__math-tools__calculate_unary_operations',
          'mcp__math-tools__calculate_binary_operations',
          'mcp__math-tools__compound_interest',
        ],
      },
    });

    for await (const message of result as AsyncIterable<SDKMessage>) {
      prettyPrintMessage(message, this.logger);
    }
  }
}
