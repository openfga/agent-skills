---
title: Simple User-Defined Roles
impact: MEDIUM
impactDescription: organization-wide custom roles
tags: roles, custom-roles, user-defined, organization
---

## Simple User-Defined Roles

For custom roles that apply globally within an organization.

**Model:**

```dsl.openfga
model
  schema 1.1

type user

type role
  relations
    define assignee: [user]

type organization
  relations
    define admin: [user]  # Static role

    # Permissions can be assigned to custom roles or static roles
    define can_create_project: [role#assignee] or admin
    define can_edit_project: [role#assignee] or admin
    define can_delete_project: [role#assignee] or admin
```

**Setting up a custom role:**

```yaml
# 1. Define role permissions
- user: role:acme-project-admin#assignee
  relation: can_create_project
  object: organization:acme

- user: role:acme-project-admin#assignee
  relation: can_edit_project
  object: organization:acme

# 2. Assign users to the role
- user: user:anne
  relation: assignee
  object: role:acme-project-admin
```

Anne now has `can_create_project` and `can_edit_project` permissions.

**Adding new permissions to existing roles:**

When you add `can_delete_project` to the model, existing roles don't automatically get it:

```yaml
- user: role:acme-project-admin#assignee
  relation: can_delete_project
  object: organization:acme
```

**Use when:**
- Roles apply at the organization level
- Same role permissions everywhere
- Simple permission structure
