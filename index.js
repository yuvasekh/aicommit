#!/usr/bin/env node

import 'dotenv/config';
import simpleGit from 'simple-git';
import { generatePRContent } from './generatePRContent.js';
import { execSync } from 'child_process';

const git = simpleGit();

async function main() {
  await git.fetch(); // <-- Ensure latest remote refs

  const status = await git.status();
  const currentBranch = status.current;
  const targetBranch = process.argv[2] || 'main';

  console.log(`Current branch: ${currentBranch}`);
  console.log(`Target branch: ${targetBranch}`);

  // Use remote ref to be safe
  const diff = execSync(`git diff origin/${targetBranch}..origin/${currentBranch}`).toString();

  if (!diff.trim()) {
    console.log('No differences found between branches.');
    return;
  }
console.log(diff,"diff")
  const prMessage = await generatePRContent(diff, currentBranch, targetBranch);

  if (status.staged.length > 0) {
    await git.commit('Auto-commit before PR');
  }

  await git.push('origin', currentBranch);

  execSync(`gh pr create --base ${targetBranch} --head ${currentBranch} --title "${prMessage.title}" --body "${prMessage.body}"`, {
    stdio: 'inherit',
  });
}

main().catch(console.error);
