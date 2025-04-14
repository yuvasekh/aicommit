import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePRContent(diff, currentBranch, targetBranch) {
  const prompt = `
You are a senior software engineer helping to write a Pull Request description.

The diff below is from branch "${currentBranch}" compared to "${targetBranch}".

Generate:
1. A concise and informative PR title.
2. A detailed PR body explaining the motivation, changes made, and anything that needs review.

Diff:
${diff}
`;

console.log(prompt,"yuva")

  const result = await generateText({
    model: openai('gpt-4'),
    prompt,
  });

  const [title, ...bodyLines] = result.text.split('\n');
  return {
    title: title.trim(),
    body: bodyLines.join('\n').trim(),
  };
}
