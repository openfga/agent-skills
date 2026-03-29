---
title: Hierarchical Structures
impact: HIGH
impactDescription: scalable permission inheritance
tags: design, hierarchy, inheritance, folders
---

## Hierarchical Structures

Model parent-child relationships to enable permission inheritance through hierarchies. Store parent links only where structurally necessary and propagate roles through the chain — never duplicate a parent relation at every level.

**Example (folder hierarchy):**

```dsl.openfga
model
  schema 1.1

type user

type organization
  relations
    define member: [user]
    define admin: [user]

type folder
  relations
    define organization: [organization]
    define parent_folder: [folder]
    define org_admin: admin from organization
    define owner: [user] or owner from parent_folder
    define editor: [user] or owner or editor from parent_folder
    define viewer: [user] or editor or viewer from parent_folder or member from organization
    define can_delete: owner or org_admin

type document
  relations
    define parent_folder: [folder]
    define org_admin: org_admin from parent_folder
    define owner: [user] or owner from parent_folder
    define editor: [user] or owner or editor from parent_folder
    define viewer: [user] or editor or viewer from parent_folder
    define can_delete: owner or org_admin
```

**Tuples for nested structure:**

```yaml
# Organization setup
- user: user:cto
  relation: admin
  object: organization:acme

# Root folder belongs to organization
- user: organization:acme
  relation: organization
  object: folder:root

# Nested folder structure — only parent links, no organization tuple needed
- user: folder:root
  relation: parent_folder
  object: folder:engineering

- user: folder:engineering
  relation: parent_folder
  object: folder:backend

# Document in nested folder — only parent link needed
- user: folder:backend
  relation: parent_folder
  object: document:api-spec
```

The CTO can delete all documents in all nested folders because `org_admin` chains through the parent hierarchy automatically. No `organization` tuple is needed on `folder:engineering`, `folder:backend`, or `document:api-spec`.

**Key patterns:**
- Store the parent link to the root type (e.g. `organization`) only on the **top-level** object in the hierarchy
- Child types reference their **immediate parent**, not the root: `define parent_folder: [folder]`
- Propagate parent-level roles as local computed relations: `define org_admin: org_admin from parent_folder`
- Permissions use the local computed relation: `can_delete: owner or org_admin`
- Each level adds its own direct grants with `[user]`

**Incorrect (duplicating the parent at every level):**

```dsl.openfga
type document
  relations
    define organization: [organization]   # WRONG: duplicates parent link
    define parent_folder: [folder]
    define can_delete: owner or admin from organization
```

```yaml
# WRONG: requires an organization tuple on every single object
- user: organization:acme
  relation: organization
  object: document:api-spec
```

This forces you to write an `organization` tuple for every object in the system, which defeats the purpose of having a hierarchy.

**Correct (chain through the hierarchy):**

```dsl.openfga
type document
  relations
    define parent_folder: [folder]
    define org_admin: org_admin from parent_folder  # chains up automatically
    define can_delete: owner or org_admin
```

```yaml
# Only the parent link is needed — org_admin resolves through the chain
- user: folder:backend
  relation: parent_folder
  object: document:api-spec
```

**Propagate all relevant parent roles, not just org-level ones:**

Any role defined on a parent type that is meaningful to child resources should be chained down. This applies to roles like `owner`, `head`, `manager`, `lead` — not just organization-level roles like `admin`.

**Incorrect (parent role forgotten on child types):**

```dsl.openfga
type department
  relations
    define head: [user]
    define can_view: head

type job
  relations
    define department: [department]
    define recruiter: [user]
    define can_view: recruiter              # department head has no visibility!
```

The department head can see the department but is locked out of jobs within it.

**Correct (chain the parent role down):**

```dsl.openfga
type department
  relations
    define head: [user]
    define can_view: head

type job
  relations
    define department: [department]
    define department_head: head from department
    define recruiter: [user]
    define can_view: department_head or recruiter
```

**Include parent roles in concentric role hierarchies:**

When a parent type defines an `owner` or similar role, include it in the child type's role hierarchy so it cascades automatically:

```dsl.openfga
type store
  relations
    define owner: [user]
    define manager: [user] or owner           # owner is a manager
    define staff: [user] or manager           # manager is staff

type product
  relations
    define store: [store]
    define can_edit: manager from store        # owner gets access via manager
```

This is better than chaining `owner` separately because it uses the existing concentric role chain — the owner automatically gets staff and manager access to all child resources.

**Audit checklist for hierarchies:**

When reviewing a model, for each parent-child relationship check:
1. Does the parent type define roles (owner, head, manager, lead, etc.)?
2. Are those roles relevant to the child resources?
3. If yes, are they chained down as computed relations or included in a concentric role chain?

**Benefits:**
- Single permission grant propagates to entire subtree
- Revoke access by removing one tuple
- No redundant tuples — parent roles resolve through the chain
- Parent roles like owner, head, manager are not accidentally excluded from child resources
- Natural mapping to file system and organizational structures
