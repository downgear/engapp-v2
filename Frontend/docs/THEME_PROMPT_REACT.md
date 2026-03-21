# React Prompt: English Speaking App Themes (Worker-Focused)

Use this prompt when generating or redesigning UI blocks in this project.

## Prompt

Build a ReactJS + Tailwind UI for an English-practice speaking web app for working professionals.

Constraints:
- Keep the existing website theme as the default theme. Do not modify default theme colors.
- Add exactly two additional themes:
  - Mint Productivity: calm, bright, high-focus visual language.
  - Forest Focus: executive deep-green visual language with warm contrast accent.
- Total themes must be 3.

Technical requirements:
- Use a ThemeContext with `themeConfigs`, `currentTheme`, `setCurrentTheme`, and `useTheme` hook.
- Persist theme in `localStorage`.
- Apply theme via root `data-app-theme` attribute and CSS variable overrides.
- Reuse semantic tokens: `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--accent`, `--muted`, `--border`, `--ring`.
- Avoid hardcoding colors in page components.

UX requirements:
- Provide a compact theme switcher with animated swatches and active-state ring.
- Add smooth color transitions (`duration-300` to `duration-500`) for containers, cards, and text.
- Keep contrast high and readable for long study sessions.
- UI must feel premium and practical for workers, not playful/kid style.
- Responsive on desktop and mobile.

Dynamic component requirements:
- Hero card with topic focus and progress indicator.
- Practice action area with microphone CTA and subtle motion.
- Weekly analytics card (minutes + speaking turns).
- Feedback panel with collapsible sections for highlights and improvements.
- Navigation with global theme switch access.

Quality bar:
- No visual regressions in default theme.
- New themes must look distinct and production-ready.
- Components should use shared UI primitives and existing project conventions.
