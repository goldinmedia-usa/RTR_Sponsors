#!/usr/bin/env python3
"""Utilities for Goldie's skill registry."""

from __future__ import annotations

import argparse
import json
import os
import sys
import textwrap
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_REGISTRY = ROOT / "goldie" / "skills.json"
REQUIRED_SKILL_FIELDS = {
    "id",
    "name",
    "category",
    "status",
    "summary",
    "integrations",
    "inputs",
    "outputs",
    "workflow",
    "guardrails",
}


def load_registry(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def validate_registry(registry: dict[str, Any]) -> list[str]:
    errors: list[str] = []

    agent = registry.get("agent")
    if not isinstance(agent, dict):
        errors.append("registry.agent must be an object")
    elif not agent.get("name"):
        errors.append("registry.agent.name is required")

    skills = registry.get("skills")
    if not isinstance(skills, list) or not skills:
        errors.append("registry.skills must be a non-empty array")
        return errors

    seen_ids: set[str] = set()
    for index, skill in enumerate(skills):
        label = f"skills[{index}]"
        if not isinstance(skill, dict):
            errors.append(f"{label} must be an object")
            continue

        missing = sorted(REQUIRED_SKILL_FIELDS - set(skill))
        if missing:
            errors.append(f"{label} missing fields: {', '.join(missing)}")

        skill_id = skill.get("id")
        if not isinstance(skill_id, str) or not skill_id:
            errors.append(f"{label}.id must be a non-empty string")
        elif skill_id in seen_ids:
            errors.append(f"{label}.id duplicates {skill_id!r}")
        else:
            seen_ids.add(skill_id)

        for field in ("integrations", "inputs", "outputs", "workflow", "guardrails"):
            value = skill.get(field)
            if not isinstance(value, list) or not value:
                errors.append(f"{label}.{field} must be a non-empty array")

    return errors


def list_skills(registry: dict[str, Any], category: str | None = None) -> None:
    skills = registry["skills"]
    if category:
        skills = [skill for skill in skills if skill["category"] == category]

    if not skills:
        print("No skills found.")
        return

    for skill in skills:
        print(f"{skill['id']}\t{skill['category']}\t{skill['name']}")


def show_skill(registry: dict[str, Any], skill_id: str) -> int:
    skill = next((item for item in registry["skills"] if item["id"] == skill_id), None)
    if skill is None:
        print(f"Unknown skill: {skill_id}", file=sys.stderr)
        return 1

    print(f"{skill['name']} ({skill['id']})")
    print(f"Category: {skill['category']}")
    print(f"Status: {skill['status']}")
    print()
    print(textwrap.fill(skill["summary"], width=88))

    for field in ("integrations", "inputs", "outputs", "workflow", "guardrails"):
        print()
        print(field.replace("_", " ").title() + ":")
        for item in skill[field]:
            print(f"- {item}")

    return 0


def github_search(query: str, limit: int) -> int:
    params = urllib.parse.urlencode(
        {
            "q": query,
            "sort": "stars",
            "order": "desc",
            "per_page": max(1, min(limit, 20)),
        }
    )
    request = urllib.request.Request(
        f"https://api.github.com/search/repositories?{params}",
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "goldie-skill-research",
        },
    )

    token = os.environ.get("GITHUB_TOKEN")
    if token:
        request.add_header("Authorization", f"Bearer {token}")

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:  # noqa: BLE001 - CLI should surface API/network failures simply.
        print(f"GitHub search failed: {exc}", file=sys.stderr)
        return 1

    items = payload.get("items", [])
    if not items:
        print("No repositories found.")
        return 0

    for item in items[:limit]:
        description = item.get("description") or "No description"
        pushed_at = item.get("pushed_at", "unknown")
        license_info = item.get("license") or {}
        license_name = license_info.get("spdx_id") or "NOASSERTION"
        print(item["full_name"])
        print(f"  URL: {item['html_url']}")
        print(f"  Stars: {item['stargazers_count']} | Updated: {pushed_at} | License: {license_name}")
        print(f"  {description}")
        print()

    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Manage Goldie's skill registry.")
    parser.add_argument(
        "--registry",
        type=Path,
        default=DEFAULT_REGISTRY,
        help=f"path to the skills registry (default: {DEFAULT_REGISTRY})",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("validate", help="validate the skills registry")

    list_parser = subparsers.add_parser("list", help="list registered skills")
    list_parser.add_argument("--category", help="filter by category")

    show_parser = subparsers.add_parser("show", help="show one skill")
    show_parser.add_argument("skill_id")

    search_parser = subparsers.add_parser("search-github", help="look up skill examples on GitHub")
    search_parser.add_argument("query", help="GitHub repository search query")
    search_parser.add_argument("--limit", type=int, default=5, help="number of repositories to show")

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "search-github":
        return github_search(args.query, args.limit)

    registry = load_registry(args.registry)

    if args.command == "validate":
        errors = validate_registry(registry)
        if errors:
            for error in errors:
                print(f"ERROR: {error}", file=sys.stderr)
            return 1
        print(f"Validated {len(registry['skills'])} Goldie skills.")
        return 0

    if args.command == "list":
        list_skills(registry, args.category)
        return 0

    if args.command == "show":
        return show_skill(registry, args.skill_id)

    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
