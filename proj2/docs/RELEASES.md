# Release Management

This document describes the release process for CampusBot, including how to create release snapshots and tags.

## Release Process

### Creating a Release

1. **Update Version Number**
   - Update `version` in `package.json`
   - Update version in `docs/openapi.yaml`
   - Update version in `README.md` if needed

2. **Create Release Tag**
   ```bash
   git tag -a v0.2.0 -m "Release version 0.2.0"
   git push origin v0.2.0
   ```

3. **Create GitHub Release**
   - Go to GitHub repository
   - Click "Releases" → "Create a new release"
   - Select the tag you just created
   - Add release notes describing changes
   - Attach any relevant artifacts

### Release Naming Convention

Releases follow semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

Examples:
- `v0.1.0` - Initial release
- `v0.2.0` - Milestone 4 completion
- `v1.0.0` - First stable release

### Release Snapshots

Each release tag represents a snapshot of the repository at that point in time. The tag includes:

- All source code
- Documentation
- Test suite
- Configuration files
- Build artifacts (if included)

### Release Checklist

Before creating a release:

- [ ] All tests pass (`npm test`)
- [ ] Code coverage meets requirements
- [ ] Documentation is up to date
- [ ] CHANGELOG.md is updated
- [ ] Version numbers are updated
- [ ] No sensitive data in repository
- [ ] Build succeeds (`npm run build`)

### Current Releases

- **v0.1.0** - Milestone 1: Core API Foundation
- **v0.2.0** - Milestone 4: Vendor Kiosk & Order Handoff Flow

### Release Notes Template

```markdown
## Version X.Y.Z

### Added
- Feature 1
- Feature 2

### Changed
- Change 1
- Change 2

### Fixed
- Bug fix 1
- Bug fix 2

### Removed
- Deprecated feature
```

### Tagging Commands

```bash
# Create annotated tag
git tag -a v0.2.0 -m "Release version 0.2.0"

# List all tags
git tag

# Push tag to remote
git push origin v0.2.0

# Push all tags
git push origin --tags

# Delete local tag
git tag -d v0.2.0

# Delete remote tag
git push origin --delete v0.2.0
```


