#!/usr/bin/env python3
"""
Add a news feed entry to the Immersive Gallery.

Usage:
  python3 scripts/add-news-entry.py <category> "<text>"

Categories: events, activities, works, releases

If run with no arguments, prints the current feed.
The script updates data/news-feed.json, commits, and pushes
to trigger a GitHub Pages redeploy.
"""

import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

FEED_PATH = os.path.join(ROOT, 'data', 'news-feed.json')

CATEGORIES = ['events', 'activities', 'works', 'releases']
LABELS = {
    'events': 'Upcoming Events',
    'activities': 'Current Activities',
    'works': 'Current Works',
    'releases': 'New Releases',
}


def load_feed():
    if not os.path.exists(FEED_PATH):
        return {
            'events': '—',
            'activities': '—',
            'works': '—',
            'releases': '—',
        }
    with open(FEED_PATH, 'r') as f:
        return json.load(f)


def save_feed(data):
    os.makedirs(os.path.dirname(FEED_PATH), exist_ok=True)
    with open(FEED_PATH, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')


def show_feed(data):
    print('📰 Current News Feed\n')
    for key in CATEGORIES:
        label = LABELS.get(key, key)
        text = data.get(key, '—')
        print(f'  {label}:')
        print(f'    {text}\n')


def update_feed(category, text):
    data = load_feed()
    data[category] = text
    save_feed(data)
    print(f'✅ Updated {LABELS.get(category, category)} → "{text}"')
    return data


def commit_and_push(category, text):
    """Commit the change and push to trigger deploy."""
    try:
        subprocess.run(
            ['git', 'add', 'data/news-feed.json'],
            cwd=ROOT, check=True, capture_output=True, text=True
        )
        subprocess.run(
            ['git', 'commit', '-m', f'feat: update news feed — {LABELS.get(category, category)}'],
            cwd=ROOT, check=True, capture_output=True, text=True
        )
        subprocess.run(
            ['git', 'push'],
            cwd=ROOT, check=True, capture_output=True, text=True
        )
        print('🚀 Committed and pushed — deployment in progress.')
    except subprocess.CalledProcessError as e:
        if 'nothing to commit' in e.stderr or 'nothing to commit' in e.stdout:
            print('ℹ️  No changes to commit (text unchanged).')
        else:
            print(f'⚠️  Git error: {e.stderr}')
            print('   Manual push may be required.')


def main():
    if len(sys.argv) == 1:
        # Show current feed
        data = load_feed()
        show_feed(data)
        return

    if len(sys.argv) != 3:
        print('Usage:')
        print(f'  python3 {sys.argv[0]}                    # show feed')
        print(f'  python3 {sys.argv[0]} <category> "<text>"  # update entry')
        print(f'\nCategories: {", ".join(CATEGORIES)}')
        sys.exit(1)

    category = sys.argv[1].lower().strip()
    text = sys.argv[2].strip()

    if category not in CATEGORIES:
        print(f'❌ Invalid category "{category}". Choose from: {", ".join(CATEGORIES)}')
        sys.exit(1)

    if not text:
        print('❌ Text cannot be empty.')
        sys.exit(1)

    update_feed(category, text)
    commit_and_push(category, text)


if __name__ == '__main__':
    main()
