import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

export const GIT_OPTIONS: ToolOption[] = [
  { key: 'filter', label: 'Search', type: 'text', default: '', placeholder: 'Filter git commands...' },
];

const LINES: string[] = [
  '# Setup & config',
  'git config --global user.name "name"  set your name',
  'git config --global user.email "you@example.com"  set your email',
  'git init  initialize a repo',
  'git clone <url>  clone a repo',
  '',
  '# Basic snapshotting',
  'git status  show changes',
  'git add <file>  stage',
  'git add .  stage everything',
  'git commit -m "msg"  commit',
  'git commit --amend  amend the last commit',
  'git diff  show unstaged changes',
  'git diff --staged  show staged changes',
  'git restore <file>  discard working changes',
  'git rm <file>  remove a file',
  'git mv <old> <new>  move/rename a file',
  '',
  '# Branching & merging',
  'git branch  list branches',
  'git checkout -b <name>  new branch',
  'git switch <name>  switch branch',
  'git merge <branch>  merge a branch',
  'git rebase <branch>  rebase onto a branch',
  'git branch -d <name>  delete a branch',
  '',
  '# Sharing & updating',
  'git push  push to remote',
  'git push -u origin <branch>  push and set upstream',
  'git pull  fetch + merge',
  'git fetch  download remote refs',
  'git remote -v  list remotes',
  'git remote add origin <url>  add a remote',
  '',
  '# Inspection & history',
  'git log --oneline  compact history',
  'git log --graph --all  graph history',
  'git show <commit>  show a commit',
  'git blame <file>  who changed each line',
  '',
  '# Undoing & stashing',
  'git stash  stash changes',
  'git stash pop  restore stashed changes',
  'git reset --hard <ref>  reset to a ref',
  'git reset --soft <ref>  reset keeping changes staged',
  'git revert <commit>  revert a commit',
  'git cherry-pick <commit>  apply a commit',
  '',
  '# Tagging',
  'git tag <name>  create a tag',
  'git tag -a <name> -m "msg"  annotated tag',
  'git push --tags  push tags',
];

export function buildGit(options: ToolOptions): string {
  const q = String(options.filter ?? '').trim().toLowerCase();
  if (!q) return LINES.join('\n');
  return LINES.filter((line) => line.toLowerCase().includes(q)).join('\n');
}
