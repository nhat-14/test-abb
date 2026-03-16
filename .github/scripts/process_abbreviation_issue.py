import os
import re
from pathlib import Path

HEADER = """# 略語データベース (Abbreviation Database)

このファイルを編集して、新しい略語を追加したり既存の略語を修正したりできます。

## データ形式

各略語は以下の形式で記述してください：

```
### 略語名
- **日本語**: 意味（日本語）
- **English**: English Meaning
```

---

"""

DATA_FILE = Path("data/abbreviations.md")


def extract_field(body: str, label: str) -> str:
    normalized_body = body.replace("\r\n", "\n")
    pattern = (
        rf"\*\*{re.escape(label)}\s*:?\s*\*\*\s*:?[ \t]*"
        rf"(.*?)(?=\n\s*\*\*[^*]+\s*:?\s*\*\*\s*:?|\n---|\Z)"
    )
    match = re.search(pattern, normalized_body, re.DOTALL)
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

        if abbreviation == "略語名":
            continue

        for line in lines[1:]:
            stripped = line.strip()
            if stripped.startswith("- **日本語**:"):
                meaning_ja = stripped.replace("- **日本語**:", "", 1).strip()
            elif stripped.startswith("- **English**:"):
                meaning_en = stripped.replace("- **English**:", "", 1).strip()

        if abbreviation and (meaning_ja or meaning_en):
            items.append(
                {
                    "abbreviation": abbreviation,
                    "meaningJa": meaning_ja,
                    "meaningEn": meaning_en,
                }
            )

    return items


def generate_markdown(items):
    output = [HEADER]
    for item in sorted(items, key=lambda current: current["abbreviation"].lower()):
        output.append(
            f"### {item['abbreviation']}\n"
            f"- **日本語**: {item['meaningJa']}\n"
            f"- **English**: {item['meaningEn']}\n\n"
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

    if not abbreviation or not (meaning_ja or meaning_en):
        raise SystemExit("Issue body must include abbreviation and at least one meaning")

    items = parse_markdown(DATA_FILE.read_text(encoding="utf-8"))
    is_update = issue_title.upper().startswith("[UPDATE]")

    updated_item = {
        "abbreviation": abbreviation,
        "meaningJa": meaning_ja,
        "meaningEn": meaning_en,
    }

    target_index = None
    for index, item in enumerate(items):
        if item["abbreviation"] == original_abbreviation:
            target_index = index
            break

    action = "Add"
    if target_index is not None:
        items[target_index] = updated_item
        action = "Update"
    else:
        duplicate_index = next((index for index, item in enumerate(items) if item["abbreviation"] == abbreviation), None)
        if duplicate_index is not None:
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
