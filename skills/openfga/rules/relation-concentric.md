---
title: Concentric Relationships
impact: HIGH
impactDescription: permission inheritance
tags: relations, concentric, or, inheritance
---

## Concentric Relationships

Use `or` to create nested permissions where one relation implies another. This applies both to roles and to `can_*` permissions.

### Concentric roles

**Incorrect (redundant tuples required):**

```dsl.openfga
type document
  relations
    define editor: [user]
    define viewer: [user]
```

This requires separate tuples for both editor and viewer access.

**Correct (editors inherit viewer access):**

```dsl.openfga
type document
  relations
    define editor: [user]
    define viewer: [user] or editor
```

Now editors automatically have viewer access without additional tuples.

**Typical hierarchy:**

```dsl.openfga
type document
  relations
    define owner: [user]
    define editor: [user] or owner
    define viewer: [user] or editor
```

Owners can edit and view. Editors can view. Each level inherits from the one above.

### Concentric permissions

Apply the same principle to `can_*` permissions: each permission should reference the next more-powerful permission instead of repeating the same roles. Order permissions from most restrictive (most powerful) first, then build less restrictive ones on top.

**Incorrect (repeating roles across permissions):**

```dsl.openfga
type campaign
  relations
    define owner: [user]
    define org_campaign_manager: campaign_manager from organization
    define org_analyst: analyst from organization
    define org_admin: admin from organization
    define can_view: owner or org_analyst or org_campaign_manager or org_admin
    define can_edit: owner or org_campaign_manager or org_admin
    define can_delete: org_admin
```

`org_campaign_manager` and `org_admin` are repeated in both `can_view` and `can_edit`. If you add a new role that can edit, you must remember to add it to `can_view` too.

**Correct (each permission references the next more-powerful one):**

```dsl.openfga
type campaign
  relations
    define owner: [user]
    define org_campaign_manager: campaign_manager from organization
    define org_analyst: analyst from organization
    define org_admin: admin from organization
    define can_delete: org_admin
    define can_edit: owner or org_campaign_manager or can_delete
    define can_view: org_analyst or can_edit
```

`can_view` includes everyone who `can_edit`, which includes everyone who `can_delete`. Each role appears exactly once.

**Ordering rule:** define the most restrictive permission first (`can_delete`), then build up:

```
can_delete  →  can_edit  →  can_view
(strongest)    (medium)     (weakest)
```

Less restrictive permissions reference more restrictive ones via `or can_<more_restrictive>`, adding only the roles unique to that level.

**Benefits:**
- Fewer tuples needed
- Consistent permission semantics
- Easier to reason about access levels
- Each role appears exactly once — no risk of forgetting to add a role at every level
- Adding a new role requires changing only one permission
