import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), 'live-ux-audit', 'baseline');
const recordsDir = path.join(root, 'records');
const files = fs.existsSync(recordsDir)
  ? fs.readdirSync(recordsDir).filter(name => name.endsWith('.json'))
  : [];

const records = files.map(name =>
  JSON.parse(fs.readFileSync(path.join(recordsDir, name), 'utf8'))
);
const pageRecords = records.filter(record => record.metrics);

const summary = {
  generatedAt: new Date().toISOString(),
  recordCount: records.length,
  pageRecordCount: pageRecords.length,
  widths: [...new Set(records.map(record => record.project))],
  overflow: pageRecords
    .filter(record => record.metrics.scrollWidth > record.metrics.innerWidth + 1)
    .map(record => ({
      project: record.project,
      scenario: record.scenario,
      width: record.metrics.innerWidth,
      scrollWidth: record.metrics.scrollWidth,
    })),
  pageErrors: records.flatMap(record =>
    (record.signals?.pageErrors || []).map(error => ({
      project: record.project,
      scenario: record.scenario,
      error,
    }))
  ),
  consoleErrors: records.flatMap(record =>
    (record.signals?.consoleErrors || []).map(error => ({
      project: record.project,
      scenario: record.scenario,
      error,
    }))
  ),
  failedRequests: records.flatMap(record =>
    (record.signals?.failedRequests || []).map(error => ({
      project: record.project,
      scenario: record.scenario,
      error,
    }))
  ),
  badResponses: records.flatMap(record =>
    (record.signals?.badResponses || []).map(error => ({
      project: record.project,
      scenario: record.scenario,
      error,
    }))
  ),
  axeViolations: pageRecords.flatMap(record =>
    (record.axeViolations || []).map(violation => ({
      project: record.project,
      scenario: record.scenario,
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.length,
    }))
  ),
  undersizedTargets: pageRecords.flatMap(record =>
    (record.metrics.undersizedTargets || []).map(target => ({
      project: record.project,
      scenario: record.scenario,
      ...target,
    }))
  ),
};

fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(
  path.join(root, 'summary.json'),
  JSON.stringify(summary, null, 2) + '\n',
);

const lines = [
  '# Live production UX audit baseline',
  '',
  'Production URL: https://fuelvoice.vercel.app',
  'Records: ' + summary.recordCount,
  'Rendered states: ' + summary.pageRecordCount,
  '',
  '| Signal | Count |',
  '| --- | ---: |',
  '| Document overflow | ' + summary.overflow.length + ' |',
  '| Page errors | ' + summary.pageErrors.length + ' |',
  '| Console errors | ' + summary.consoleErrors.length + ' |',
  '| Failed requests | ' + summary.failedRequests.length + ' |',
  '| HTTP 4xx/5xx responses | ' + summary.badResponses.length + ' |',
  '| Axe violations | ' + summary.axeViolations.length + ' |',
  '| Visible targets below 24px in either dimension | ' + summary.undersizedTargets.length + ' |',
  '',
  '## Overflow',
  summary.overflow.length
    ? '~~~json\n' + JSON.stringify(summary.overflow, null, 2) + '\n~~~'
    : 'None.',
  '',
  '## Axe findings',
  summary.axeViolations.length
    ? '~~~json\n' + JSON.stringify(summary.axeViolations, null, 2) + '\n~~~'
    : 'None in audited states.',
  '',
  '## Console/page/network signals',
  '~~~json',
  JSON.stringify({
    pageErrors: summary.pageErrors.slice(0, 30),
    consoleErrors: summary.consoleErrors.slice(0, 30),
    failedRequests: summary.failedRequests.slice(0, 30),
    badResponses: summary.badResponses.slice(0, 30),
  }, null, 2),
  '~~~',
  '',
  '## Undersized visible targets',
  summary.undersizedTargets.length
    ? '~~~json\n' + JSON.stringify(summary.undersizedTargets.slice(0, 100), null, 2) + '\n~~~'
    : 'None below 24px in the audited rendered states.',
];

fs.writeFileSync(path.join(root, 'summary.md'), lines.join('\n') + '\n');
