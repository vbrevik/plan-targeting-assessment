# 📝 Documentation Standards

## 1. File Naming Conventions

### Feature Documentation
- **Prefix**: Use the feature acronym (e.g., `BDA_`, `ROE_`, `DASH_`)
- **Format**: `PREFIX_TOPIC_TYPE.md`
- **Examples**:
  - `BDA_MASTER_GUIDE.md` (Main guide)
  - `BDA_API_REFERENCE.md` (Reference)
  - `ROE_STATUS_FEATURE.md` (Feature spec)

### System Documentation
- **Format**: `TOPIC_TYPE.md` (Uppercase snake_case)
- **Examples**:
  - `DECISION_SYSTEM_ARCHITECTURE.md`
  - `UPDATED_ARCHITECTURE_SUMMARY.md`

### Implementation Guides
- **Format**: `TIMEFRAME_IMPLEMENTATION_PLAN.md` or `TOPIC_IMPLEMENTATION_GUIDE.md`
- **Examples**:
  - `WEEK_1_IMPLEMENTATION_PLAN.md`
  - `DASHBOARD_IMPLEMENTATION_GUIDE.md`

---

## 2. Organization Structure

### Root Directory (`docs/`)
- **Keep minimal**: Only key entry points and current comprehensive guides
- **Examples**: `INDEX.md`, `START_HERE.md`

### Feature Directories (e.g., `docs/bda/`)
- **Content**: All current documentation for a specific feature
- **Required Files**:
  - `FEATURE_MASTER_GUIDE.md`: Entry point
  - `FEATURE_API_REFERENCE.md`: Technical details
  - `FEATURE_IMPLEMENTATION_PLAN.md`: Current plan

### Archive Directory (`docs/ARCHIVE/`)
- **Purpose**: Historical documents, completed phase reports, session logs
- **Structure**:
  - `sessions/`: Agent logs, task summaries
  - `feature/phaseX/`: Completed phase documentation
- **Rule**: Never delete, always archive

---

## 3. Documentation Lifecycle

### 1. Creation
- Start with a clear purpose and audience
- Add to the appropriate feature directory
- Link from `INDEX.md` or Feature Master Guide

### 2. Updates
- Update in place for active features
- Update "Last Updated" date in file header

### 3. Archival
- **When**: A phase is completed or a document is superseded
- **How**: Move to `docs/ARCHIVE/feature/phaseX/`
- **Update**: Remove link from `INDEX.md` (or move to Archive section)

---

## 4. Content Guidelines

### Header Format
Each document should start with:
```markdown
# 🎯 Title

## 📋 Context
- **Status**: [Draft/Active/Archived]
- **Owner**: [Role/Team]
- **Last Updated**: YYYY-MM-DD
```

### Sections
- **Executive Summary**: 1st section, < 200 words
- **Visuals**: Use diagrams or screenshots early
- **Navigation**: Link back to `INDEX.md` or Master Guide at the bottom

---

## 5. Version Control for Docs

- **Commit Messages**: `docs(feature): update API reference`
- **PRs**: Documentation changes should accompany code changes
- **Version Tags**: Update `INDEX.md` version on major milestones
