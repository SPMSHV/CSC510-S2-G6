# Accessibility Documentation

## Overview

CampusBot is committed to ensuring digital accessibility for people with disabilities. We continuously work to improve the accessibility of our software and documentation, adhering to WCAG 2.1 Level AA standards.

## Documentation Accessibility Standards

All CampusBot documentation follows these accessibility guidelines:

### 1. Document Structure

- **Proper Heading Hierarchy**: All documents use semantic heading levels (H1 → H2 → H3) without skipping levels
- **Clear Navigation**: Table of contents provided for longer documents
- **Logical Reading Order**: Content flows logically from top to bottom
- **Semantic Markup**: Proper use of Markdown elements (lists, code blocks, emphasis)

### 2. Text Accessibility

- **Plain Language**: Technical terms are explained when first introduced
- **Clear Link Text**: Links describe their destination (e.g., "View Installation Guide" not "Click here")
- **Sufficient Contrast**: Code blocks and emphasis maintain readable contrast ratios
- **Font Sizing**: Markdown headers provide clear size differentiation
- **Line Length**: Documentation maintains readable line lengths (80-100 characters)

### 3. Visual Elements

- **Alt Text for Images**: All images include descriptive alt text
- **ASCII Art Alternatives**: Complex diagrams include text descriptions
- **Color Independence**: Information is not conveyed by color alone
- **Icons with Labels**: Emoji and icons are accompanied by text labels

### 4. Code Examples

- **Syntax Highlighting**: Code blocks use consistent, accessible highlighting
- **Copy-Paste Friendly**: Code examples are formatted for easy copying
- **Context Provided**: Each code example includes explanatory text
- **Line Numbers**: Available but not required for comprehension

### 5. Tables

- **Headers Defined**: Tables use proper header rows
- **Simple Structure**: Tables avoid nested or merged cells where possible
- **Text Alternatives**: Complex tables include summary descriptions
- **Responsive**: Tables are readable on mobile devices

## Application Accessibility Features

### Frontend (Student App & Vendor Kiosk)

#### Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order follows logical reading order
- Focus indicators are visible
- Skip navigation links provided where appropriate

#### Screen Reader Support
- ARIA labels on all interactive elements
- ARIA live regions for dynamic content updates
- Semantic HTML elements (nav, main, article, etc.)
- `.sr-only` class for screen reader-only text

#### Visual Design
- Minimum contrast ratio of 4.5:1 for normal text
- Minimum contrast ratio of 3:1 for large text
- Focus indicators meet 3:1 contrast requirement
- No information conveyed by color alone

#### Responsive Design
- Mobile-first approach ensures touch target sizes
- Text scales appropriately on zoom
- Layout remains functional at 200% zoom
- Horizontal scrolling avoided

### Backend API

#### Documentation
- OpenAPI specification with detailed descriptions
- Examples provided for all endpoints
- Error messages are clear and actionable
- Status codes follow REST conventions

#### Accessibility Through Design
- RESTful design follows predictable patterns
- Consistent response formats
- Pagination support for large datasets
- Rate limiting with clear feedback

## Testing Accessibility

### Automated Testing
```bash
# Run frontend accessibility tests (future)
npm run test:a11y

# Check documentation with markdown linter
npm run lint:docs
```

### Manual Testing Checklist

#### Documentation
- [ ] Heading hierarchy is logical (H1 → H2 → H3)
- [ ] All images have alt text
- [ ] Links have descriptive text
- [ ] Code examples have context
- [ ] Tables have proper headers
- [ ] No broken links

#### Application
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces all content
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA
- [ ] Works at 200% zoom
- [ ] Form labels are associated with inputs

### Screen Reader Testing

We recommend testing with:
- **NVDA** (Windows, free)
- **JAWS** (Windows, commercial)
- **VoiceOver** (macOS/iOS, built-in)
- **TalkBack** (Android, built-in)

### Browser Testing

Accessibility features tested in:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Android)

## Reporting Accessibility Issues

If you encounter accessibility barriers in CampusBot:

1. **Check Known Issues**: Review our [GitHub Issues](https://github.com/SPMSHV/CSC510-S2-G6/issues) labeled `accessibility`
2. **File a New Issue**: Use our accessibility issue template
3. **Include Details**:
   - Description of the barrier
   - Browser/assistive technology used
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)

## Accessibility Resources

### Standards & Guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Section 508](https://www.section508.gov/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://pa11y.org/)

### Documentation Tools
- [Markdown Lint](https://github.com/DavidAnson/markdownlint)
- [Vale Prose Linter](https://vale.sh/)

## Conformance Status

**Current Status**: WCAG 2.1 Level AA - Partial Conformance

### What This Means
- Core functionality is accessible
- Some non-critical features may have accessibility issues
- We are actively working toward full conformance
- Priority given to issues affecting core user tasks

### Known Limitations
1. **Documentation Videos**: Demo videos currently lack captions (planned)
2. **Complex Visualizations**: Some telemetry charts need enhanced descriptions
3. **Historical Content**: Older documentation being updated to current standards

### Improvement Roadmap
- **Q1 2026**: Add video captions and transcripts
- **Q1 2026**: Enhanced keyboard shortcuts documentation
- **Q2 2026**: Full WCAG 2.1 Level AA conformance audit
- **Q2 2026**: Automated accessibility testing in CI/CD

## Developer Guidelines

### Writing Accessible Documentation

1. **Start with a Clear Title**: Use H1 for document title
2. **Create a Table of Contents**: For documents >5 sections
3. **Use Descriptive Headings**: Make headings scannable
4. **Write Clear Links**: "Installation Guide" not "here"
5. **Add Alt Text**: Describe what's in the image
6. **Keep Paragraphs Short**: 3-4 sentences maximum
7. **Use Lists**: Break down sequential steps
8. **Test with Screen Reader**: Verify it makes sense

### Coding Accessible Components

1. **Use Semantic HTML**: `<button>` not `<div onclick>`
2. **Add ARIA Labels**: When semantic HTML isn't enough
3. **Manage Focus**: Ensure logical tab order
4. **Test Keyboard Nav**: Tab through your feature
5. **Check Contrast**: Use browser devtools
6. **Test Zoom**: Verify at 200% zoom
7. **Use Linters**: Enable accessibility ESLint rules

### Example: Accessible Button

```tsx
// Good: Semantic HTML with clear label
<button
  onClick={handleSubmit}
  aria-label="Submit order"
  disabled={!isValid}
>
  Submit Order
</button>

// Bad: Non-semantic without accessibility
<div onClick={handleSubmit} className="button">
  Submit
</div>
```

### Example: Accessible Form

```tsx
<form onSubmit={handleSubmit} aria-label="Order checkout form">
  <label htmlFor="delivery-location">
    Delivery Location
    <span className="sr-only">(required)</span>
  </label>
  <input
    id="delivery-location"
    type="text"
    required
    aria-required="true"
    aria-describedby="location-hint"
  />
  <span id="location-hint" className="text-sm text-gray-600">
    Enter your building and room number
  </span>
  
  {error && (
    <div role="alert" aria-live="polite" className="error">
      {error}
    </div>
  )}
</form>
```

## Contact

For accessibility questions or concerns:
- **GitHub Issues**: Tag with `accessibility` label
- **Email**: accessibility@campusbot.example.com (fictional)
- **Response Time**: We aim to respond within 2 business days

## Last Updated

This accessibility documentation was last updated: November 2025

---

**Commitment**: CampusBot is committed to providing an accessible experience for all users. We welcome feedback and continuously work to improve accessibility across all aspects of our platform.

