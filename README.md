# MDocs: a GitHub-integrated, Notion-style markdown editor

Collaborative markdown editor for GitHub. Google Docs experience for teams managing agent configs, style guides, and playbooks in repos.

* * *

## Why MDocs exists

Modern teams are storing more of their critical knowledge in GitHub than ever before. Style guides, agent configs, sales playbooks, and persona definitions increasingly live as markdown files in repos because AI tools like Claude Code and Cursor need to read them from source.

But the people who _own_ that content often are not engineers with experience writing markdown and using Git commands.

MDocs is built to bridge the gap between collaborative doc-editing tools like Notion and the new world (for many) of markdown and GitHub.

* * *

## Supported file types

| File Type | Example | Owner | Update Frequency |
| --- | --- | --- | --- |
| Agent config | CLAUDE.md | Eng lead + PM | Weekly |
| Brand style guide | style_guide.md | Marketing | Monthly |
| Sales playbook | playbook.md | Sales lead | Quarterly |
| AI persona definition | persona.md | Product | As needed |
| Onboarding doc | onboarding.md | People ops | Per hire |

* * *

## Core features

### 1\. GitHub-native editing

All files live in GitHub. MDocs is a **lens over your repos**, not a separate system. Nothing gets out of sync because there is only one source of truth.

### 2\. WYSIWYG markdown editor

Toggle between a clean visual editor and raw markdown. Supports:

-   **Bold** and _italic_ text
    
-   `Inline code` and full code blocks
    
-   Tables, horizontal rules, and block quotes
    
-   H1, H2, and H3 headings
    

### 3\. Pull request workflow

For protected branches, MDocs creates a PR on your behalf. You fill in a title — we handle the branch, the commit, and the diff.

### 4\. Inline comments

Select any passage and leave a comment for a teammate. No more Slack messages saying _"see line 47 of the style guide."_

* * *

## Save states

| Status | Meaning |
| --- | --- |
| Unsaved changes | Edits exist locally, not yet committed |
| Saved to draft | Stored in browser, not in GitHub |
| Committed | Written directly to branch |
| PR open | Changes proposed, awaiting review |

* * *

## Getting started

1.  Sign in with GitHub
    
2.  Install the MDocs GitHub App on your org
    
3.  Browse to any `.md` file in your repos
    
4.  Start editing — no terminal required
    

* * *

## Coming soon

-   **Real-time multiplayer** — see teammates' cursors live
    
-   **Style guide compliance check** — flag inconsistencies across files automatically
    
-   **File relationship graph** — know when a change in one file affects another