---
description: "Use when onboarding TCTBP into a brand new repository and customising the template files from a project brief, stack details, commands, docs paths, and deployment expectations."
---

# Onboard TCTBP Into A New Repository

Use this prompt in a newly created repository after copying in the TCTBP template files.

## Goal

Customise the TCTBP template files for the new repository without weakening the workflow guard rails or introducing project-specific guesses that were not provided.

## Files To Read First

Before editing anything, read these files:

- `.github/copilot-instructions.md`
- `.github/TCTBP.json`
- `.github/TCTBP Agent.md`
- `.github/TCTBP Cheatsheet.md`

## Files To Edit

Customise these files for the new repository:

- `.github/TCTBP.json`
- `.github/TCTBP Agent.md`
- `.github/TCTBP Cheatsheet.md`
- `.github/copilot-instructions.md`

## Required Behaviour

1. Use `.github/copilot-instructions.md` as the governing template guidance.
2. Replace all angle-bracket placeholders when the required information is provided.
3. If a field truly does not apply, remove it cleanly or use `null` only where the template already allows it.
4. Keep the TCTBP workflow generic, durable, and safe.
5. Do not hard-code language, framework, package manager, deployment target, or docs paths unless they were explicitly provided.
6. Preserve the no-code-loss guarantees across `ship`, `handover`, `resume`, `branch`, `deploy`, `status`, and `abort`.
7. Keep the behavioural guidance in Markdown aligned with the machine-readable profile in `.github/TCTBP.json`.
8. Validate JSON and Markdown after editing.
9. Keep the trigger semantics distinct: `ship` for formal release, `handover` for end-of-session shared-state sync, `resume` for start-of-session restore, and `branch <new-branch-name>` for safe branch closeout and next-branch creation.

## What You Must Not Guess

Do not guess any of the following:

- test, lint, build, or release-build commands
- version source of truth or version files
- deploy or install commands
- post-deploy validation checks
- documentation review paths
- branch naming preferences
- locale conventions

If any of those are missing, ask for confirmation or leave the template in an explicitly unresolved but clean state.

## Project Details To Supply

Fill in the values below before sending this prompt, or answer follow-up questions if some values are unknown.

```text
Project details:
- Name: <PROJECT_NAME>
- Short description: <SHORT_PROJECT_DESCRIPTION>
- Primary language: <PRIMARY_LANGUAGE>
- Frameworks/libraries: <FRAMEWORKS_OR_NONE>
- Package/build tool: <PACKAGE_OR_BUILD_TOOL>
- Default branch: <DEFAULT_BRANCH>
- Version file(s): <VERSION_FILES>
- Version source hint: <VERSION_SOURCE_HINT>
- Format command: <FORMAT_COMMAND_OR_NULL>
- Test command: <TEST_COMMAND>
- Lint command: <LINT_COMMAND_OR_NULL>
- Build command: <BUILD_COMMAND>
- Release build command: <RELEASE_BUILD_COMMAND_OR_NULL>
- Deploy target name: <DEPLOY_TARGET_NAME_OR_NONE>
- Deploy target description: <DEPLOY_TARGET_DESCRIPTION_OR_NONE>
- Install or deploy command(s): <INSTALL_COMMANDS_OR_NONE>
- Post-deploy check(s): <POST_DEPLOY_CHECKS_OR_NONE>
- User guide path: <USER_GUIDE_PATH_OR_NULL>
- Feature overview path: <FEATURE_OVERVIEW_PATH_OR_NULL>
- UI/system doc path: <UI_DOC_PATH_OR_NULL>
- Config/settings doc path: <CONFIG_DOC_PATH_OR_NULL>
- Roadmap doc path: <ROADMAP_DOC_PATH_OR_NULL>
- Status doc path: <STATUS_DOC_PATH_OR_NULL>
- Packaging or release doc path: <PACKAGING_DOC_OR_SCRIPT_PATH_OR_NULL>
- Locale or writing convention: <LOCALE_OR_NONE>
- Branch naming preferences: <BRANCH_NAMING_PREFERENCES_OR_DEFAULT>
- Deploy enabled: <YES_OR_NO>
- Any repo-specific constraints or guard rails: <ADDITIONAL_CONSTRAINTS_OR_NONE>
```

## Task

Read the TCTBP template files, customise them for this repository using the project details above, and keep the workflow logic consistent across all files.

When adapting the workflow, preserve the intended trigger separation:

- `ship` creates formal release state when the repo wants version and tag semantics
- `handover` is the end-of-session sync path for durable shared state
- `resume` is the start-of-session restore path
- `branch <new-branch-name>` closes out the current branch safely and starts the next one from an updated default branch

When you finish:

1. Summarise the changes made.
2. List any values that still need confirmation.
3. Call out any placeholders intentionally left unresolved.
4. Mention any workflow rules that you chose to keep at their default values.

## Preferred Output Style

- Make the edits directly.
- Keep changes small and precise.
- Avoid broad rewrites unless they are required for consistency.
- Prefer consistency between files over local convenience in any one file.