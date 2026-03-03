---
description: Write technical blog posts following Netflix Engineering Blog style and brand guidelines
keywords: [blog, writing, netflix, engineering, technical, content]
---

# Netflix Engineering Blog Writer

This skill writes technical blog posts that follow the Netflix Engineering Blog style guide and brand voice.

## When to Use

Use this skill when you need to:

- Write technical blog posts about engineering topics
- Follow Netflix's engineering blog style and tone
- Create content that balances technical depth with accessibility
- Structure posts with clear narrative flow

## Netflix Engineering Blog Brand Guidelines

### Voice & Tone

- **Confident but humble**: Share expertise without arrogance
- **Technical but accessible**: Explain complex concepts clearly
- **Story-driven**: Use narrative structure, not just facts
- **Collaborative**: Emphasize team efforts and learnings
- **Problem-solution oriented**: Start with challenges, show solutions

### Structure

1. **Compelling Hook** (1-2 paragraphs)
   - Start with the problem or challenge
   - Make it relatable and set stakes
2. **Context & Background** (2-3 paragraphs)
   - Explain why this matters
   - Provide necessary technical context
   - Share the journey that led here
3. **Deep Dive** (Main content)
   - Technical details and architecture
   - Use diagrams when helpful (describe them)
   - Show code snippets for key concepts
   - Explain trade-offs and decisions
4. **Results & Impact** (1-2 paragraphs)
   - Quantifiable improvements
   - Real-world impact
   - Lessons learned
5. **Looking Forward** (Conclusion)
   - Future directions
   - Open questions
   - Call to action or reflection

### Writing Style

- Use first-person plural ("we", "our") to emphasize collaboration
- Break up long paragraphs (3-4 sentences max)
- Use subheadings liberally for scanability
- Include concrete examples and metrics
- Avoid jargon unless necessary (and explain when used)
- Use active voice over passive
- Be specific: "reduced latency by 40%" not "improved performance"

### Technical Content

- Code snippets should be minimal and illustrative
- Explain the "why" not just the "what"
- Discuss trade-offs and alternatives considered
- Share both successes and challenges
- Link to relevant papers, tools, or prior art

## Output Format

Generate blog posts in Markdown with:

- Clear heading hierarchy (# for title, ## for sections, ### for subsections)
- Code blocks with language specification
- Inline code for technical terms
- Emphasis for key points
- A separator (---) between major sections

## Example Transformations

**Bad opening**: "This post is about our caching system."

**Good opening**: "When streaming video to 200+ million members worldwide, every millisecond of latency matters. Last year, we noticed our content metadata cache was becoming a bottleneck during peak hours. This is the story of how we rebuilt it."

**Bad explanation**: "We used Redis for caching."

**Good explanation**: "We evaluated several caching solutions—Redis for its speed, Memcached for its simplicity, and Cassandra for its distributed nature. We ultimately chose Redis because our access patterns favored single-key lookups, and we needed sub-millisecond latency guarantees."
