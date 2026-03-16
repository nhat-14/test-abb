import os
import re
from collections import defaultdict
from pathlib import Path

HEADER = """# 略語データベース (Abbreviation Database)

このファイルを編集して、新しい略語を追加したり既存の略語を修正したりできます。

## データ形式

各略語は以下の形式で記述してください：

```
### 略語名
- **日本語**: 意味（日本語）
- **English**: English Meaning
- **カテゴリ**: カテゴリ名
```

---

"""

DATA_FILE = Path("data/abbreviations.md")


def extract_field(body: str, label: str) -> str:
    pattern = rf"\*\*{re.escape(label)}\*\*:\s*(.*?)(?=\n\*\*[^*]+\*\*:|\n---|\Z)"
    match = re.search(pattern, body, re.DOTALL)
    if not match:
        return ""
    return match.group(1).strip()


def parse_markdown(text: str):
    items = []
    sections = re.split(r"^### ", text, flags=re.MULTILINE)[1:]

    for section in sections:
        lines = section.strip().splitlines()
        if not lines:
            continue

        abbreviation = lines[0].strip()
        meaning_ja = ""
        meaning_en = ""
        category = ""

        for line in lines[1:]:
            stripped = line.strip()
            if stripped.startswith("- **日本語**:"):
                meaning_ja = stripped.replace("- **日本語**:", "", 1).strip()
            elif stripped.startswith("- **English**:"):
                meaning_en = stripped.replace("- **English**:", "", 1).strip()
            elif stripped.startswith("- **カテゴリ**:"):
                category = stripped.replace("- **カテゴリ**:", "", 1).strip()

        if abbreviation and (meaning_ja or meaning_en):
            items.append(
                {
                    "abbreviation": abbreviation,
                    "meaningJa": meaning_ja,
                    "meaningEn": meaning_en,
                    "category": category,
                }
            )

    return items


def generate_markdown(items):
    grouped = defaultdict(list)
    for item in items:
        grouped[item.get("category") or "未分類"].append(item)

    output = [HEADER]
    for category in sorted(grouped):
        output.append(f"## {category}\n\n")
        for item in sorted(grouped[category], key=lambda current: current["abbreviation"].lower()):
            output.append(
                f"### {item['abbreviation']}\n"
                f"- **日本語**: {item['meaningJa']}\n"
                f"- **English**: {item['meaningEn']}\n"
                f"- **カテゴリ**: {item.get('category') or '未分類'}\n\n"
            )
        output.append("---\n\n")

    return "".join(output)


def main():
    issue_title = os.environ["ISSUE_TITLE"].strip()
    issue_body = os.environ["ISSUE_BODY"]
    issue_number = os.environ["ISSUE_NUMBER"].strip()
    issue_url = os.environ["ISSUE_URL"].strip()

    abbreviation = extract_field(issue_body, "略語")
    original_abbreviation = extract_field(issue_body, "元の略語 (編集時のみ)") or abbreviation
    meaning_ja = extract_field(issue_body, "意味 (日本語)")
    meaning_en = extract_field(issue_body, "意味 (English)")
    category = extract_field(issue_body, "カテゴリ")

    if not abbreviation or not (meaning_ja or meaning_en):
        raise SystemExit("Issue body must include abbreviation and at least one meaning")

    items = parse_markdown(DATA_FILE.read_text(encoding="utf-8"))
    is_update = issue_title.upper().startswith("[UPDATE]")

    updated_item = {
        "abbreviation": abbreviation,
        "meaningJa": meaning_ja,
        "meaningEn": meaning_en,
        "category": category or "未分類",
    }

    target_index = None
    for index, item in enumerate(items):
        if item["abbreviation"] == original_abbreviation:
            target_index = index
            if not category:
                updated_item["category"] = item.get("category") or "未分類"
            break

    action = "Add"
    if target_index is not None:
        items[target_index] = updated_item
        action = "Update"
    else:
        duplicate_index = next((index for index, item in enumerate(items) if item["abbreviation"] == abbreviation), None)
        if duplicate_index is not None:
            updated_item["category"] = category or items[duplicate_index].get("category") or "未分類"
            items[duplicate_index] = updated_item
            action = "Update"
        else:
            items.append(updated_item)

    DATA_FILE.write_text(generate_markdown(items), encoding="utf-8")

    output_file = os.environ["GITHUB_OUTPUT"]
    with open(output_file, "a", encoding="utf-8") as handle:
        handle.write(f"commit_message={action} abbreviation from issue #{issue_number}: {abbreviation}\n")
        handle.write(f"pr_title={action} abbreviation: {abbreviation}\n")
        handle.write(f"pr_body=Automatically generated from issue #{issue_number} ({issue_url})\n")


if __name__ == "__main__":
    main()
