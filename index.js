#!/usr/bin/env node

import 'dotenv/config';
import simpleGit from 'simple-git';
import { generatePRContent } from './generatePRContent.js';
import { execSync } from 'child_process';

const git = simpleGit();

async function main() {
  const status = await git.status();
  const currentBranch = status.current;

  const targetBranch = process.argv[2] || 'main';

  console.log(`Current branch: ${currentBranch}`);
  console.log(`Target branch: ${targetBranch}`);

  // Get the diff between branches
  const diff = execSync(`git diff ${targetBranch}...${currentBranch}`).toString();

  if (!diff.trim()) {
    console.log('No differences found between branches.');
    return;
  }

  // Generate PR message with AI
  const prMessage = await generatePRContent(diff, currentBranch, targetBranch);

  // Commit staged changes if any
  if (status.staged.length > 0) {
    await git.commit('Auto-commit before PR');
  }

  // Push branch
  await git.push('origin', currentBranch);

  // Create PR
  execSync(`gh pr create --base ${targetBranch} --head ${currentBranch} --title "${prMessage.title}" --body "${prMessage.body}"`, { stdio: 'inherit' });
}

main().catch(console.error);
