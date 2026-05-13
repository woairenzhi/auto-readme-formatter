const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const filePath = core.getInput('file-path') || 'README.md';
    const generateToc = core.getBooleanInput('generate-toc');
    const fixWhitespace = core.getBooleanInput('fix-whitespace');
    const standardizeBadges = core.getBooleanInput('standardize-badges');
    const addSponsorsLink = core.getBooleanInput('add-sponsors-link');

    core.info(`Processing: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      core.setFailed(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Standardize badges - normalize badge markdown format
    if (standardizeBadges) {
      content = standardizeBadgeLines(content);
      core.info('✓ Badges standardized');
    }

    // Fix whitespace
    if (fixWhitespace) {
      content = fixTrailingWhitespace(content);
      core.info('✓ Whitespace fixed');
    }

    // Generate table of contents
    if (generateToc) {
      content = generateTableOfContents(content);
      core.info('✓ Table of contents generated');
    }

    // Add sponsors link
    if (addSponsorsLink) {
      content = addSponsorsSection(content);
      core.info('✓ Sponsors link added');
    }

    // Write changes if different
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      core.info(`✅ ${filePath} has been formatted successfully.`);
    } else {
      core.info(`ℹ️ No changes needed for ${filePath}.`);
    }

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

function standardizeBadgeLines(content) {
  const lines = content.split('\n');
  const result = [];
  let inBadgeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Check if line is a badge (shields.io or img.shields.io)
    if (line.includes('img.shields.io') || line.includes('shields.io')) {
      // Ensure badge lines don't have trailing whitespace
      line = line.trim();
      // Remove duplicate badges (same URL)
      if (!result.includes(line)) {
        result.push(line);
      }
    } else {
      result.push(line);
    }
  }
  return result.join('\n');
}

function fixTrailingWhitespace(content) {
  const lines = content.split('\n');
  const trimmed = lines.map(line => line.replace(/[ \t]+$/, ''));
  return trimmed.join('\n');
}

function generateTableOfContents(content) {
  const lines = content.split('\n');
  const headings = [];
  let tocStart = -1;
  let tocEnd = -1;

  // Check for existing TOC markers
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '<!-- TOC -->' || lines[i].trim().toLowerCase() === '## table of contents') {
      tocStart = i;
    }
    if (tocStart !== -1 && (lines[i].trim() === '<!-- /TOC -->' || (lines[i].startsWith('## ') && i > tocStart && i <= tocStart + 3))) {
      tocEnd = i;
      break;
    }
  }

  // Collect all headings (h2 and h3)
  const collectedHeadings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip headings inside TOC area
    if (tocStart !== -1 && i >= tocStart && i <= tocEnd) continue;

    const h2Match = line.match(/^## (.+)/);
    const h3Match = line.match(/^### (.+)/);
    if (h2Match) {
      collectedHeadings.push({ level: 2, text: h2Match[1] });
    } else if (h3Match) {
      collectedHeadings.push({ level: 3, text: h3Match[1] });
    }
  }

  if (collectedHeadings.length === 0) {
    return content;
  }

  // Build TOC
  const tocLines = ['## Table of Contents', ''];
  for (const h of collectedHeadings) {
    const indent = h.level === 3 ? '  ' : '';
    const link = h.text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    tocLines.push(`${indent}- [${h.text}](#${link})`);
  }
  tocLines.push('');

  // Find insertion point (after h1 if it exists)
  let insertIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('# ') && lines[i].trim().match(/^# .+/)) {
      insertIndex = i + 1;
      // Skip blank lines after h1
      while (insertIndex < lines.length && lines[insertIndex].trim() === '') {
        insertIndex++;
      }
      break;
    }
  }

  // If TOC exists, replace it
  if (tocStart !== -1 && tocEnd !== -1) {
    const before = lines.slice(0, tocStart);
    const after = lines.slice(tocEnd + 1);
    return [...before, ...tocLines, ...after].join('\n');
  }

  // Otherwise insert
  const before = lines.slice(0, insertIndex);
  const after = lines.slice(insertIndex);
  return [...before, ...tocLines, ...after].join('\n');
}

function addSponsorsSection(content) {
  const sponsorSection = `

---

## Sponsors

Support this project by becoming a sponsor! Your logo will show up here with a link to your website.

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-pink?style=flat-square&logo=github-sponsors)](https://github.com/sponsors/woairenzhi)
`;

  // Only add if not already present
  if (content.includes('github.com/sponsors/woairenzhi')) {
    return content;
  }

  return content + sponsorSection;
}

run();
