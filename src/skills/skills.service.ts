import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Options, Query, SDKUserMessage } from '@anthropic-ai/claude-agent-sdk';
import { loadEsm } from 'load-esm';
import { SDKMessage } from 'src/interfaces/sdk-message';
import { prettyPrintMessage } from 'src/utils/pretty-print-message';

/*
What Are Skills?

Agent skills are specialized capabilities packaged as SKILL.md files that:
-> Extend Claude's abilities domain-specific knowledge
-> Are autonomously invoked by Claude when relevant
-> Live in the filesystem (not programmatically defined)
-> Can be shared via git (project skills) or kept personal (user skills)

How skills work with the SDK
Skills are:
-> Defined as filesystem artifacts: Created as `SKILL.md` files in `.claude/skills/`
-> Loaded from the file system: Must specify `setting_sources` to load skills
-> Automatically discovered: Skill metadata loaded at startup; full content loaded when triggered
-> Model-invoked: Claude choses when to use them based on context
-> Enabled via allowed_tools: Add `Skill` to your `allowed_tools`

IMPORTANT: By default, the SDK does NOT load filesystem settings. You must explicitly configure setting_sources=["user", "project"].

Skill locations
Skills are loaded from specific filesystem directories:
-> Project skills (.claude/skills/): Shared with your team via git
        -> Loaded when `setting_sources` includes `project`
        -> Example: `.claude/skills/code-review/SKILL.md`
-> User skills (.claude/skills/): Personal Skills accross all projects
        -> Loaded when `setting_sources` includes `user`
        -> Example: `.claude/skills/my-workflow/SKILL.md`
-> Plugin skills: Bundled with installed Claude Code plugins
*/

@Injectable()
export class SkillsService implements OnModuleInit {
  private logger = new Logger(SkillsService.name);
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

  async discoverSkills() {
    // get the current working directory
    const cwd = process.cwd();
    const result: Query = this.query({
      prompt: `What Skills are available?`,
      options: {
        model: 'claude-sonnet-4-6',
        permissionMode: 'bypassPermissions',
        allowedTools: ['Skill'],
        settingSources: ['user', 'project'],
        cwd,
      },
    });

    for await (const message of result as AsyncIterable<SDKMessage>) {
      prettyPrintMessage(message, this.logger);
    }
  }

  async writeBlogPost() {
    const cwd = process.cwd();
    const blogOutputFile = `distributed_tracing_blog_post.md`;
    const prompt = `
    Write a blog post about implementing a distributed tracing system for microservices. The team migrated from a monolithic logging approach to OpenTelemetry-based distributed tracing, reducing debugging time by 60% and improving indirect respose.
    
    Include:
    - The problem with the old logging system
    - Why we chose OpenTelemetry
    - Key implementation challenges
    - Performance metrics and impact
    
    Please write this blog post following Netflix Engineering Blog guidelines and save it to ${blogOutputFile}`;

    const result: Query = this.query({
      prompt,
      options: {
        model: 'claude-sonnet-4-6',
        permissionMode: 'bypassPermissions',
        allowedTools: ['Skill'],
        settingSources: ['user', 'project'],
        cwd,
      },
    });

    for await (const message of result as AsyncIterable<SDKMessage>) {
      prettyPrintMessage(message, this.logger);
    }
  }
}
