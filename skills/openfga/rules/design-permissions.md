---
title: Define Permissions with can_ Relations
impact: HIGH
impactDescription: clear permission semantics
tags: design, permissions, can_, best-practices
---

## Define Permissions with can_ Relations

Define specific permissions using `can_<action>` relations that cannot be directly assigned.

**Incorrect (checking relations directly):**

```dsl.openfga
type document
  relations
    define owner: [user]
    define editor: [user] or owner
    define viewer: [user] or editor
```

Application checks `editor` relation but semantics are unclear.

**Correct (explicit permissions):**

```dsl.openfga
type document
  relations
    define owner: [user]
    define editor: [user] or owner
    define viewer: [user] or editor

    define can_view: viewer
    define can_edit: editor
    define can_delete: owner
    define can_share: owner
```

**Application code:**

```typescript
// Clear intent - checking specific permissions
await fga.check({ user, relation: 'can_view', object: doc })
await fga.check({ user, relation: 'can_edit', object: doc })
await fga.check({ user, relation: 'can_delete', object: doc })
```

**Benefits:**
- Clear separation between roles and permissions
- Permissions can combine multiple roles
- Easier to evolve without breaking applications
- Self-documenting model

**Make permissions concentric:**

When multiple `can_*` permissions share roles, don't repeat them — reference the more powerful permission instead. Order from most restrictive first, and build less restrictive permissions on top:

```dsl.openfga
type document
  relations
    define owner: [user]
    define editor: [user]
    define parent_folder: [folder]
    define org_admin: org_admin from parent_folder

    # Most restrictive first
    define can_delete: owner or org_admin
    define can_edit: editor or can_delete
    define can_view: viewer or can_edit
```

**Incorrect (repeating roles):**

```dsl.openfga
    define can_view: owner or editor or viewer or org_admin
    define can_edit: owner or editor or org_admin
    define can_delete: owner or org_admin
```

**Correct (concentric references):**

```dsl.openfga
    define can_delete: owner or org_admin
    define can_edit: editor or can_delete
    define can_view: viewer or can_edit
```

Each role appears exactly once. Adding a new role that can edit only requires changing `can_edit` — `can_view` picks it up automatically.
