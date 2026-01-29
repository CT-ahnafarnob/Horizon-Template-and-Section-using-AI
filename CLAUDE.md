# Shopify Theme Horizon Context

## Project Overview
This is a standard Shopify 2.0 Theme using Liquid, Vanilla JS, and CSS.
The project emphasizes "Horizon" template customization.

## Key Files & Directories
- `AGENTS.md`: **CRITICAL**. Contains all detailed Liquid documentation, coding standards, and architectural rules.
- `sections/`: Main page modules. MUST include `{% schema %}`.
- `blocks/`: Smaller reusable components.
- `assets/`: Vanilla JS and global CSS.

## Development Workflow
- **Run**: `shopify theme dev` (served at `http://127.0.0.1:9292`)
- **Lint**: `shopify theme check`
- **Deploy**: `shopify theme push`

## Coding Standards
- **CSS**: Use `{% stylesheet %}` inside sections/blocks. Avoid global CSS files for component-specific styles.
- **JS**: Use `{% javascript %}` or vanilla JS assets. No jQuery.
- **Liquid**: Follow strict syntax in `AGENTS.md`. Use `{% doc %}` for snippets.
- **Schema**: Validate all JSON schemas. Use translation keys (`t:`).

## Agent Behavior
1. **Always read `AGENTS.md`** before starting complex Liquid tasks.
2. Ensure specific "WOW" aesthetics as per system prompt (smooth animations, modern typography).
3. Validate schemas after every edit.
4. Use Absolute Paths for all file operations.
