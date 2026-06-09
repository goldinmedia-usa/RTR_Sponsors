# Goldie Skills

Goldie is a creative agent for client production, marketing, analytics, sales support,
and business operations. The source of truth is `goldie/skills.json`.

## Skill registry format

Each skill includes:

- `id`: stable machine-readable identifier.
- `name`: human-readable skill name.
- `category`: grouping for filtering and routing.
- `status`: current availability flag.
- `summary`: short capability description.
- `integrations`: tools, platforms, or APIs the skill may use.
- `inputs`: information Goldie should collect before acting.
- `outputs`: artifacts Goldie should produce.
- `workflow`: default operating steps.
- `guardrails`: approval, privacy, licensing, policy, or spend controls.

## Current skill set

### Agent development

- **GitHub Skill Research**: searches public GitHub projects for agent skill
  examples and implementation patterns.

### Video and image production

- **Final Cut Pro Editing**: organizes footage, builds edits, prepares FCPXML
  handoffs, and manages review/export checklists.
- **Adobe Premiere Pro Editing**: supports Premiere bins, sequences, captions,
  audio, graphics, color, and export presets.
- **DaVinci Resolve Editing**: supports Resolve timelines, color, Fairlight,
  Fusion, conforming, finishing, and project archives.
- **Photoshop Photo Editing**: supports retouching, compositing, resizing,
  color correction, and platform-specific exports.
- **Higgsfield Plug-in Generation**: creates AI-generated scene, theme, shot,
  and campaign concepts using Higgsfield plug-ins.

### Client operations

- **Gmail Email Operations**: drafts, answers, schedules, and summarizes Gmail
  messages with approval gates.
- **Google Drive Workspace Management**: creates project folders, Docs, Sheets,
  Slides, asset libraries, deliverable indexes, and permission summaries.

### Product development

- **App Creation**: scopes and builds lightweight apps, prototypes, landing
  pages, campaign experiences, and internal tools.

### Marketing and analytics

- **Social Media Analytics**: collects and interprets performance across social
  platforms.
- **Paid Ads Management**: plans, launches, monitors, and optimizes campaigns
  across Meta, TikTok, Google, YouTube, LinkedIn, Pinterest, Snap, and X.
- **Analytics Reporting**: creates client-ready reports with metrics, charts,
  findings, and recommendations.
- **Marketing Strategy Planning**: builds marketing plans, content calendars,
  positioning, channel mixes, and campaign roadmaps.

### Sales operations

- **Price Deck Building**: creates pricing decks with packages, deliverables,
  terms, assumptions, and next steps.
- **Invoice Management**: prepares invoice drafts, billing emails, trackers,
  and follow-up reminders.
- **Offer Email Creation**: drafts prospect and client offer emails with
  subject lines, proof points, and follow-up sequences.

## Approval model

Goldie can prepare drafts, plans, reports, folder structures, campaign setups,
and creative handoff notes without publishing or sending them. Goldie should ask
for explicit approval before:

- Sending emails or invoices.
- Launching ads or changing ad spend.
- Publishing content.
- Sharing Google Drive files externally.
- Replacing final creative masters.
- Making claims about pricing, terms, legal, tax, or guaranteed performance.

## CLI usage

The helper script uses only the Python standard library.

```bash
python scripts/goldie_skills.py validate
python scripts/goldie_skills.py list
python scripts/goldie_skills.py list --category video-editing
python scripts/goldie_skills.py show paid_ads_management
python scripts/goldie_skills.py search-github "ai agent skills"
```

For higher GitHub API rate limits, set `GITHUB_TOKEN` before using
`search-github`.

## Adding more skills

1. Add a new object to `goldie/skills.json`.
2. Keep the `id` lowercase and stable.
3. Include all required fields.
4. Add approval guardrails for spend, publishing, external sharing, client data,
   and legally sensitive communications.
5. Run `python scripts/goldie_skills.py validate`.
