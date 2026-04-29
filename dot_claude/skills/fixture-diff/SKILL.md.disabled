---
name: fixture-diff
description: Generate a side-by-side HTML comparison of fixture images (generated vs reference). Non-gradient fixtures with any diff are flagged as bugs. Use when checking visual regressions after rendering changes.
---

# fixture-diff

Generate an HTML report at `/tmp/fixture_diff_report.html` comparing generated fixture images against reference images.

## What it does

- Computes pixel-level AE (absolute error) diff for every fixture using ImageMagick
- Sorts images by diff percentage (highest first), bugs first
- **Two-tier policy**:
  - **Gradient/filter/blur fixtures** (expected engine differences): color-coded red > 5%, orange 1–5%, green < 1%
  - **All other fixtures**: ANY diff (even 1 pixel) is flagged as a **BUG** (bright red with BUG badge)
- Side-by-side layout: generated (new) on the left, reference (master) on the right
- Summary at the top showing bug count
- Opens instantly in any browser via `file://` URLs (no server needed)

## Gradient whitelist

These fixture name patterns are treated as "expected diff" (engine differences are normal):

- `style_background_image_*`
- `style_mask_image_*`
- `style_backdrop_filter*`
- `style_filter*`
- `stylesheets_background_multiple_gradients*`

Everything else uses zero-tolerance: any diff = bug.

## Usage

Run this when asked to compare fixture images or check visual regressions. The user can then open `/tmp/fixture_diff_report.html` in a browser.

The directories default to the standard takumi layout but can be overridden:

- `GENERATED`: path to the generated fixtures directory (default: `tests/fixtures-generated` relative to cwd)
- `REFERENCE`: path to the reference fixtures directory (default: `tests/fixtures-reference` relative to cwd)

## Instructions

Run the following as a single Bash command, substituting the correct absolute paths:

```bash
GENERATED="$(pwd)/tests/fixtures-generated"
REFERENCE="$(pwd)/tests/fixtures-reference"
TOTAL=756000  # default 1200x630; adjust if fixture size differs

cat > /tmp/fixture_diff_report.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Fixture Image Diff Report</title>
<style>
  body { font-family: monospace; background: #111; color: #eee; margin: 0; padding: 16px; }
  h1 { color: #fff; margin-bottom: 4px; }
  .meta { color: #888; font-size: 13px; margin-bottom: 8px; }
  .summary { font-size: 14px; margin-bottom: 20px; padding: 10px 14px; border-radius: 6px; background: #1a1a1a; border: 1px solid #333; }
  .summary .bug-count { color: #e53935; font-weight: bold; }
  .summary .ok-count  { color: #2e7d32; font-weight: bold; }
  .fixture { margin-bottom: 24px; border-radius: 6px; overflow: hidden; }
  .fixture.bug        { border: 2px solid #e53935; }
  .fixture.suspicious { border: 2px solid #e53935; }
  .fixture.warning    { border: 2px solid #fb8c00; }
  .fixture.ok         { border: 2px solid #2e7d32; }
  .header { display: flex; align-items: center; gap: 12px; padding: 8px 12px; }
  .fixture.bug        .header { background: #3b0000; }
  .fixture.suspicious .header { background: #3b0a0a; }
  .fixture.warning    .header { background: #2a1500; }
  .fixture.ok         .header { background: #0a1f0a; }
  .name { font-size: 14px; font-weight: bold; }
  .badge { font-size: 12px; padding: 2px 8px; border-radius: 12px; font-weight: bold; }
  .badge.bug        { background: #b71c1c; color: #fff; letter-spacing: 1px; }
  .badge.suspicious { background: #e53935; color: #fff; }
  .badge.warning    { background: #fb8c00; color: #fff; }
  .badge.ok         { background: #2e7d32; color: #fff; }
  .expected-tag { font-size: 11px; color: #666; padding: 2px 6px; border: 1px solid #444; border-radius: 4px; }
  .images { display: grid; grid-template-columns: 1fr 1fr; }
  .img-wrap { display: flex; flex-direction: column; }
  .img-label { font-size: 11px; text-align: center; padding: 4px; background: #222; color: #aaa; }
  img { width: 100%; display: block; }
</style>
</head>
<body>
HTMLEOF

# Append dynamic header
cat >> /tmp/fixture_diff_report.html << EOF
<h1>Fixture Diff Report</h1>
<p class="meta">Generated: $(date)</p>
EOF

# Compute diffs, tagging gradient/filter fixtures as expected
for f in "$GENERATED"/*.webp; do
  name=$(basename "$f")
  ref="$REFERENCE/$name"
  [ -f "$ref" ] || continue
  ae=$(magick compare -metric AE "$f" "$ref" /dev/null 2>&1 | awk '{print $1}')
  pct=$(echo "$ae $TOTAL" | awk '{printf "%.1f", $1/$2*100}')
  # Mark gradient/filter/blur fixtures as expected
  expected=0
  case "$name" in
    style_background_image_*|style_mask_image_*|style_backdrop_filter*|style_filter*|stylesheets_background_multiple_gradients*)
      expected=1 ;;
  esac
  echo "$ae $pct $expected $name"
done | sort -rn > /tmp/_fixture_diffs.txt

# Count bugs (non-expected fixtures with ae > 0)
bug_count=$(awk '$3==0 && $1>0' /tmp/_fixture_diffs.txt | wc -l)
ok_count=$(awk '$1==0' /tmp/_fixture_diffs.txt | wc -l)
total_count=$(wc -l < /tmp/_fixture_diffs.txt)

cat >> /tmp/fixture_diff_report.html << EOF
<div class="summary">
  <span class="bug-count">${bug_count} BUG(s)</span> &nbsp;|&nbsp;
  <span class="ok-count">${ok_count} perfect</span> &nbsp;|&nbsp;
  ${total_count} total fixtures &nbsp;|&nbsp;
  Policy: non-gradient any diff = BUG; gradient/filter red &gt;5%, orange 1–5%, green &lt;1%
</div>
EOF

# Render fixtures — bugs first (non-expected with ae>0), then expected by pct, then perfect
(awk '$3==0 && $1>0' /tmp/_fixture_diffs.txt | sort -rn;
 awk '$3==1' /tmp/_fixture_diffs.txt | sort -rn;
 awk '$3==0 && $1==0' /tmp/_fixture_diffs.txt) > /tmp/_fixture_diffs_sorted.txt

while read ae pct expected name; do
  if [ "$expected" = "0" ] && [ "$ae" -gt 0 ] 2>/dev/null; then
    cls="bug"; badge_text="BUG"; extra_tag=""
  elif [ "$expected" = "1" ]; then
    extra_tag='<span class="expected-tag">expected diff</span>'
    if awk "BEGIN{exit !($pct > 5)}"; then cls="suspicious"; badge_text="${pct}%"
    elif awk "BEGIN{exit !($pct > 1)}"; then cls="warning"; badge_text="${pct}%"
    else cls="ok"; badge_text="${pct}%"; fi
  else
    cls="ok"; badge_text="${pct}%"; extra_tag=""
  fi

  cat >> /tmp/fixture_diff_report.html << EOF
<div class="fixture $cls">
  <div class="header">
    <span class="badge $cls">${badge_text}</span>
    <span class="name">$name</span>
    <span style="color:#666;font-size:12px">${ae} px diff</span>
    ${extra_tag}
  </div>
  <div class="images">
    <div class="img-wrap">
      <div class="img-label">generated</div>
      <img src="file://$GENERATED/$name" loading="lazy">
    </div>
    <div class="img-wrap">
      <div class="img-label">reference</div>
      <img src="file://$REFERENCE/$name" loading="lazy">
    </div>
  </div>
</div>
EOF
done < /tmp/_fixture_diffs_sorted.txt

echo '</body></html>' >> /tmp/fixture_diff_report.html
echo "Report ready: /tmp/fixture_diff_report.html (${bug_count} bugs / ${total_count} fixtures)"
```

After running, tell the user: `Open /tmp/fixture_diff_report.html in a browser to review.`

## Tips

- ImageMagick's AE metric counts pixels that differ by at least 1 in any channel.
- A large % with visually identical images usually means sub-pixel gradient differences from different rendering backends — these are expected after engine migrations.
- Concentric-ring or diagonal-stripe diff patterns indicate gradient interpolation differences, not correctness bugs.
- If `TOTAL` is wrong for the project, compute it as `width × height` from `magick identify -format "%wx%h" <any_fixture>`.
