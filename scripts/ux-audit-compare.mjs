import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const baseline = path.join(process.cwd(), 'ux-audit', 'baseline');
const current = path.join(process.cwd(), 'ux-audit', 'final', 'current');
const output = path.join(process.cwd(), 'ux-audit', 'final');

function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function listImages(root) {
  const dir = path.join(root, 'screenshots');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(name => /\.(png|jpe?g|webp)$/i.test(name)).sort();
}

const baselineImages = listImages(baseline);
const currentImages = new Set(listImages(current));
const comparison = {
  baselineCount: baselineImages.length,
  currentCount: currentImages.size,
  matched: 0,
  identical: [],
  changed: [],
  missingFinal: [],
  extraFinal: [],
};

for (const name of baselineImages) {
  if (!currentImages.has(name)) {
    comparison.missingFinal.push(name);
    continue;
  }
  comparison.matched += 1;
  const before = sha(path.join(baseline, 'screenshots', name));
  const after = sha(path.join(current, 'screenshots', name));
  if (before === after) comparison.identical.push(name);
  else comparison.changed.push(name);
  currentImages.delete(name);
}
comparison.extraFinal = [...currentImages].sort();

const widths = [375, 768, 1280, 1920];
comparison.manifests = widths.map(width => {
  const file = path.join(current, 'manifest-' + width + '.json');
  if (!fs.existsSync(file)) return { width, missing: true };
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  const entries = manifest.entries || [];
  return {
    width,
    scenarios: entries.length,
    failed: entries.filter(entry => entry.status !== 'ok').length,
    overflow: entries.filter(entry => entry.viewport?.horizontalOverflow).map(entry => entry.scenario),
    pageErrors: entries.reduce((sum, entry) => sum + (entry.pageErrors?.length || 0), 0),
  };
});

fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'comparison.json'), JSON.stringify(comparison, null, 2) + '\n');

const md = [
  '# Final before/after screenshot comparison',
  '',
  '- Baseline screenshots: ' + comparison.baselineCount,
  '- Final screenshots: ' + comparison.currentCount,
  '- Matched filenames: ' + comparison.matched,
  '- Pixel-identical files: ' + comparison.identical.length,
  '- Changed files: ' + comparison.changed.length,
  '- Missing final files: ' + comparison.missingFinal.length,
  '- Extra final files: ' + comparison.extraFinal.length,
  '',
  'Changed screenshots are expected where the approved report allowed contrast, target-size, admin, 404, copy, footer, rating, and search-affordance changes. The deterministic manifests below are the hard regression gate for failed scenarios, page errors, and document overflow.',
  '',
  '| Width | Scenarios | Failed | Overflow scenarios | Page errors |',
  '| ---: | ---: | ---: | --- | ---: |',
  ...comparison.manifests.map(row => '| ' + row.width + ' | ' + (row.scenarios ?? '-') + ' | ' + (row.failed ?? '-') + ' | ' + ((row.overflow || []).join(', ') || 'None') + ' | ' + (row.pageErrors ?? '-') + ' |'),
  '',
  comparison.missingFinal.length ? '## Missing final screenshots\n\n' + comparison.missingFinal.map(x => '- ' + x).join('\n') : '## Missing final screenshots\n\nNone.',
  '',
  comparison.extraFinal.length ? '## Extra final screenshots\n\n' + comparison.extraFinal.map(x => '- ' + x).join('\n') : '## Extra final screenshots\n\nNone.',
  '',
];
fs.writeFileSync(path.join(output, 'comparison.md'), md.join('\n') + '\n');

if (comparison.missingFinal.length || comparison.extraFinal.length || comparison.matched !== comparison.baselineCount) {
  process.exitCode = 1;
}
if (comparison.manifests.some(row => row.missing || row.failed || row.pageErrors || (row.overflow && row.overflow.length))) {
  process.exitCode = 1;
}
