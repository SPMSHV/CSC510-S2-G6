/**
 * Copyright (c) 2025 CampusBot Contributors
 * Licensed under the MIT License
 */

import fs from 'fs';
import path from 'path';

interface Dependency {
  name: string;
  version: string;
  license?: string;
  repository?: string;
  homepage?: string;
  description?: string;
  type: 'dependency' | 'devDependency';
}

async function getPackageLicense(packageName: string): Promise<string | undefined> {
  try {
    const packagePath = path.join(process.cwd(), 'node_modules', packageName, 'package.json');
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      return pkg.license || pkg.licenses?.[0]?.type || 'Unknown';
    }
  } catch (error) {
    // Ignore errors
  }
  return undefined;
}

async function generateDependencyDocs() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  const dependencies: Dependency[] = [];

  // Process dependencies
  for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
    const license = await getPackageLicense(name);
    const pkgPath = path.join(process.cwd(), 'node_modules', name, 'package.json');
    let repository: string | undefined;
    let homepage: string | undefined;
    let description: string | undefined;

    try {
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        repository = pkg.repository?.url || pkg.repository || undefined;
        homepage = pkg.homepage;
        description = pkg.description;
      }
    } catch (error) {
      // Ignore errors
    }

    dependencies.push({
      name,
      version: version as string,
      license,
      repository,
      homepage,
      description,
      type: 'dependency',
    });
  }

  // Process devDependencies
  for (const [name, version] of Object.entries(packageJson.devDependencies || {})) {
    const license = await getPackageLicense(name);
    const pkgPath = path.join(process.cwd(), 'node_modules', name, 'package.json');
    let repository: string | undefined;
    let homepage: string | undefined;
    let description: string | undefined;

    try {
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        repository = pkg.repository?.url || pkg.repository || undefined;
        homepage = pkg.homepage;
        description = pkg.description;
      }
    } catch (error) {
      // Ignore errors
    }

    dependencies.push({
      name,
      version: version as string,
      license,
      repository,
      homepage,
      description,
      type: 'devDependency',
    });
  }

  // Generate markdown documentation
  let markdown = `# Dependency Documentation

This document lists all third-party dependencies used in CampusBot, including their versions, licenses, and repository information.

**Generated:** ${new Date().toISOString()}
**Total Dependencies:** ${dependencies.filter((d) => d.type === 'dependency').length}
**Total Dev Dependencies:** ${dependencies.filter((d) => d.type === 'devDependency').length}

## Production Dependencies

| Package | Version | License | Repository | Homepage | Description |
|---------|---------|---------|------------|----------|-------------|
`;

  dependencies
    .filter((d) => d.type === 'dependency')
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((dep) => {
      const repo = dep.repository ? `[Link](${dep.repository.replace(/^git\+/, '').replace(/\.git$/, '')})` : '-';
      const home = dep.homepage ? `[Link](${dep.homepage})` : '-';
      markdown += `| ${dep.name} | ${dep.version} | ${dep.license || 'Unknown'} | ${repo} | ${home} | ${dep.description || '-'} |\n`;
    });

  markdown += `\n## Development Dependencies\n\n`;
  markdown += `| Package | Version | License | Repository | Homepage | Description |\n`;
  markdown += `|---------|---------|---------|------------|----------|-------------|\n`;

  dependencies
    .filter((d) => d.type === 'devDependency')
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((dep) => {
      const repo = dep.repository ? `[Link](${dep.repository.replace(/^git\+/, '').replace(/\.git$/, '')})` : '-';
      const home = dep.homepage ? `[Link](${dep.homepage})` : '-';
      markdown += `| ${dep.name} | ${dep.version} | ${dep.license || 'Unknown'} | ${repo} | ${home} | ${dep.description || '-'} |\n`;
    });

  markdown += `\n## License Summary\n\n`;
  const licenseCounts: Record<string, number> = {};
  dependencies.forEach((dep) => {
    const license = dep.license || 'Unknown';
    licenseCounts[license] = (licenseCounts[license] || 0) + 1;
  });

  markdown += `| License | Count |\n`;
  markdown += `|---------|-------|\n`;
  Object.entries(licenseCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([license, count]) => {
      markdown += `| ${license} | ${count} |\n`;
    });

  markdown += `\n## Notes\n\n`;
  markdown += `- All dependencies are managed via npm and listed in \`package.json\`\n`;
  markdown += `- License information is extracted from each package's \`package.json\` file\n`;
  markdown += `- Repository links point to the source code repository for each package\n`;
  markdown += `- This document is auto-generated. Run \`npm run docs:dependencies\` to regenerate\n`;

  // Write to file
  const outputPath = path.join(process.cwd(), 'docs', 'DEPENDENCIES.md');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, markdown);

  console.log(`✅ Dependency documentation generated: ${outputPath}`);
  console.log(`   - ${dependencies.filter((d) => d.type === 'dependency').length} production dependencies`);
  console.log(`   - ${dependencies.filter((d) => d.type === 'devDependency').length} dev dependencies`);
}

generateDependencyDocs().catch(console.error);

