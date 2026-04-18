---
name: fixture-diff
description: Generate a side-by-side HTML comparison of fixture images (generated vs reference). Suspicious high-diff images appear at the top marked in red. Use when checking visual regressions after rendering changes.
---

# fixture-diff

Generate an HTML report at `/tmp/fixture_diff_report.html` comparing generated fixture images against reference images.

## What it does

- Computes pixel-level AE (absolute error) diff for every fixture using ImageMagick
- Sorts images by diff percentage (highest first)
- Color-codes: red > 5%, orange 1–5%, green < 1%
- Side-by-side layout: generated (new) on the left, reference (master) on the right
- Opens instantly in any browser via `file://` URLs (no server needed)

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
  .meta { color: #888; font-size: 13px; margin-bottom: 20px; }
  .fixture { margin-bottom: 24px; border-radius: 6px; overflow: hidden; }
  .fixture.suspicious { border: 2px solid #e53935; }
  .fixture.warning    { border: 2px solid #fb8c00; }
  .fixture.ok         { border: 2px solid #2e7d32; }
  .header { display: flex; align-items: center; gap: 12px; padding: 8px 12px; }
  .fixture.suspicious .header { background: #3b0a0a; }
  .fixture.warning    .header { background: #2a1500; }
  .fixture.ok         .header { background: #0a1f0a; }
  .name { font-size: 14px; font-weight: bold; }
  .badge { font-size: 12px; padding: 2px 8px; border-radius: 12px; font-weight: bold; }
  .badge.suspicious { background: #e53935; color: #fff; }
  .badge.warning    { background: #fb8c00; color: #fff; }
  .badge.ok         { background: #2e7d32; color: #fff; }
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
<p class="meta">Generated: $(date) &nbsp;|&nbsp; Red &gt;5%, orange 1–5%, green &lt;1%.</p>
EOF

# Compute diffs
for f in "$GENERATED"/*.webp; do
  name=$(basename "$f")
  ref="$REFERENCE/$name"
  [ -f "$ref" ] || continue
  ae=$(magick compare -metric AE "$f" "$ref" /dev/null 2>&1 | awk '{print $1}')
  pct=$(echo "$ae $TOTAL" | awk '{printf "%.1f", $1/$2*100}')
  echo "$ae $pct $name"
done | sort -rn > /tmp/_fixture_diffs.txt

# Render fixtures
while read ae pct name; do
  if awk "BEGIN{exit !($pct > 5)}"; then cls="suspicious"
  elif awk "BEGIN{exit !($pct > 1)}"; then cls="warning"
  else cls="ok"; fi

  cat >> /tmp/fixture_diff_report.html << EOF
<div class="fixture $cls">
  <div class="header">
    <span class="badge $cls">${pct}%</span>
    <span class="name">$name</span>
    <span style="color:#666;font-size:12px">${ae} px diff</span>
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
done < /tmp/_fixture_diffs.txt

echo '</body></html>' >> /tmp/fixture_diff_report.html
echo "Report ready: /tmp/fixture_diff_report.html ($(wc -l < /tmp/_fixture_diffs.txt) fixtures)"
```

After running, tell the user: `Open /tmp/fixture_diff_report.html in a browser to review.`

## Tips

- ImageMagick's AE metric counts pixels that differ by at least 1 in any channel.
- A large % with visually identical images usually means sub-pixel gradient differences from different rendering backends — these are expected after engine migrations.
- Concentric-ring or diagonal-stripe diff patterns indicate gradient interpolation differences, not correctness bugs.
- If `TOTAL` is wrong for the project, compute it as `width × height` from `magick identify -format "%wx%h" <any_fixture>`.
