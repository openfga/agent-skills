# OpenFGA Best Practices

**Version 1.0.0**
OpenFGA Community
January 2026

> **Note:**
> This document is mainly for agents and LLMs to follow when authoring,
> generating, or refactoring OpenFGA authorization models. Humans
> may also find it useful, but guidance here is optimized for automation
> and consistency by AI-assisted workflows.

---

## Abstract

Comprehensive guide for authoring OpenFGA authorization models, designed for AI agents and LLMs. Covers core concepts, relationship patterns, testing methodologies, custom roles, and model optimization. Each section includes detailed explanations, real-world examples comparing incorrect vs. correct implementations, and specific guidance to ensure correct authorization modeling.

---

## Table of Contents

1. [Core Concepts](#1-core-concepts) — **CRITICAL**
   - 1.1 [Define Types for Entity Classes](#11-define-types-for-entity-classes)
   - 1.2 [Schema Version](#12-schema-version)
   - 1.3 [Relations Belong on Object Types](#13-relations-belong-on-object-types)
   - 1.4 [Relationship Tuples as Facts](#14-relationship-tuples-as-facts)
   - 1.5 [Model vs Data Separation](#15-model-vs-data-separation)
2. [Relationship Definitions](#2-relationship-definitions) — **CRITICAL**
   - 2.1 [Direct Relationships](#21-direct-relationships)
   - 2.2 [Concentric Relationships](#22-concentric-relationships)
   - 2.3 [Indirect Relationships with X from Y](#23-indirect-relationships-with-x-from-y)
   - 2.4 [Usersets for Group-Based Access](#24-usersets-for-group-based-access)
   - 2.5 [Conditional Relationships](#25-conditional-relationships)
   - 2.6 [Wildcards for Public Access](#26-wildcards-for-public-access)
3. [Model Design Patterns](#3-model-design-patterns) — **HIGH**
   - 3.1 [Define Permissions with can_ Relations](#31-define-permissions-with-can_-relations)
   - 3.2 [Hierarchical Structures](#32-hierarchical-structures)
   - 3.3 [Organization-Level Access](#33-organization-level-access)
   - 3.4 [Naming Conventions](#34-naming-conventions)
4. [Testing and Validation](#4-testing-and-validation) — **HIGH**
   - 4.1 [Structure Tests in .fga.yaml](#41-structure-tests-in-fgayaml)
   - 4.2 [Check Assertions](#42-check-assertions)
   - 4.3 [List Objects Tests](#43-list-objects-tests)
   - 4.4 [List Users Tests](#44-list-users-tests)
   - 4.5 [Testing Conditions](#45-testing-conditions)
   - 4.6 [OpenFGA CLI Usage](#46-openfga-cli-usage)
5. [Custom Roles](#5-custom-roles) — **MEDIUM**
   - 5.1 [Simple User-Defined Roles](#51-simple-user-defined-roles)
   - 5.2 [Role Assignments for Resource-Specific Roles](#52-role-assignments-for-resource-specific-roles)
   - 5.3 [Combining Static and Custom Roles](#53-combining-static-and-custom-roles)
   - 5.4 [When to Use Each Pattern](#54-when-to-use-each-pattern)
6. [Optimization](#6-optimization) — **MEDIUM**
   - 6.1 [Simplify Models](#61-simplify-models)
   - 6.2 [Minimize Tuple Count](#62-minimize-tuple-count)
   - 6.3 [Type Restrictions](#63-type-restrictions)

---

## 1. Core Concepts

**Impact: CRITICAL**

Understanding core concepts is fundamental to creating correct and maintainable authorization models.

### 1.1 Define Types for Entity Classes

**Impact: CRITICAL (foundation of your model)**

Types define classes of objects in your system. Every entity that participates in authorization should have a type.

**Incorrect: missing types**

```dsl.openfga
model
  schema 1.1

type user

type document
  relations
    define owner: [user]
    define viewer: [user]
```

This model is missing types for organizational structure that documents might belong to.

**Correct: comprehensive types**

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
    define owner: [user]
    define viewer: [user]

type document
  relations
    define parent_folder: [folder]
    define organization: [organization]
    define owner: [user]
    define viewer: [user]
```

Identify all relevant entities: users, resources, organizational units, groups, and any containers.

### 1.2 Schema Version

**Impact: HIGH (enables full feature set)**

Always use schema version 1.1 to access all OpenFGA features.

**Incorrect: missing schema version**

```dsl.openfga
model

type user

type document
  relations
    define owner: [user]
```

**Correct: explicit schema version**

```dsl.openfga
model
  schema 1.1

type user

type document
  relations
    define owner: [user]
```

Schema 1.1 enables conditions, intersection, exclusion, and other advanced features.

### 1.3 Relations Belong on Object Types

**Impact: CRITICAL (correct model structure)**

Relations are defined on the types that represent resources being accessed, not on user types.

**Incorrect: relations on user type**

```dsl.openfga
model
  schema 1.1

type user
  relations
    define owns_document: [document]  # Wrong! Relations go on the resource
```

**Correct: relations on resource type**

```dsl.openfga
model
  schema 1.1

type user

type document
  relations
    define owner: [user]  # Correct! Defined on the resource
```

Ask "Can user U perform action A on object O?" — the relation belongs on type O.

### 1.4 Relationship Tuples as Facts

**Impact: CRITICAL (model vs data)**

Relationship tuples represent facts about who has what relationship to what object. They are the data that brings your model to life.

**Model defines possibilities:**

```dsl.openfga
type document
  relations
    define owner: [user]
    define editor: [user]
```

**Tuples establish facts:**

```yaml
tuples:
  - user: user:anne
    relation: owner
    object: document:roadmap
  - user: user:bob
    relation: editor
    object: document:roadmap
```

Without tuples, authorization checks will fail because the model only defines what is *possible*, not what *currently exists*.

### 1.5 Model vs Data Separation

**Impact: HIGH (architectural clarity)**

The authorization model (schema) is static and defines structure. Relationship tuples (data) are dynamic and change frequently.

**Model characteristics:**
- Immutable; each modification creates a new version
- Changes rarely; only when product features change
- Defines the *possible* relationships

**Tuple characteristics:**
- Mutable; written and deleted as application state changes
- Changes frequently; as users gain/lose access
- Represents the *actual* relationships

This separation enables efficient permission evaluation and decouples core logic changes from specific user permission modifications.

---

## 2. Relationship Definitions

**Impact: CRITICAL**

The building blocks for expressing authorization logic in OpenFGA.

### 2.1 Direct Relationships

**Impact: CRITICAL (explicit access grants)**

Direct relationships require explicit relationship tuples. Use type restrictions to control what can be directly assigned.

**Syntax patterns:**

| Pattern | Meaning | Example |
|---------|---------|---------|
| `[user]` | Only individual users | `define owner: [user]` |
| `[user, team#member]` | Users or team members | `define editor: [user, team#member]` |
| `[organization]` | Only organizations | `define parent: [organization]` |

**Example:**

```dsl.openfga
type document
  relations
    define owner: [user]
```

**Tuple to grant access:**

```yaml
- user: user:anne
  relation: owner
  object: document:roadmap
```

Without a tuple, user:anne has no owner relationship to document:roadmap.

### 2.2 Concentric Relationships

**Impact: HIGH (permission inheritance)**

Use `or` to create nested permissions where one relation implies another.

**Incorrect: redundant tuples required**

```dsl.openfga
type document
  relations
    define editor: [user]
    define viewer: [user]
```

This requires separate tuples for both editor and viewer access.

**Correct: editors inherit viewer access**

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

### 2.3 Indirect Relationships with X from Y

**Impact: CRITICAL (scalable hierarchical access)**

The `X from Y` pattern grants access through an intermediary object, enabling hierarchical permissions.

**Incorrect: requires tuples on every document**

```dsl.openfga
type folder
  relations
    define viewer: [user]

type document
  relations
    define viewer: [user]
```

Each document needs its own viewer tuples even if they're in the same folder.

**Correct: inherit from parent folder**

```dsl.openfga
type folder
  relations
    define viewer: [user]

type document
  relations
    define parent_folder: [folder]
    define viewer: [user] or viewer from parent_folder
```

**Tuples:**

```yaml
# Grant folder access once
- user: user:anne
  relation: viewer
  object: folder:engineering

# Link documents to folder
- user: folder:engineering
  relation: parent_folder
  object: document:spec
- user: folder:engineering
  relation: parent_folder
  object: document:design
```

Anne can view all documents in the engineering folder with just one permission tuple.

**Common patterns:**
- `viewer from parent_folder` - Folder inheritance
- `admin from organization` - Org-level admin access
- `member from team` - Team membership propagation

### 2.4 Usersets for Group-Based Access

**Impact: HIGH (efficient group management)**

Usersets (`type#relation`) represent collections of users, enabling group-based access control.

**Syntax:** `type#relation` means "all users who have this relation to objects of this type"

**Example: team-based access**

```dsl.openfga
type team
  relations
    define member: [user]

type document
  relations
    define editor: [user, team#member]
```

**Tuples:**

```yaml
# Add users to team
- user: user:anne
  relation: member
  object: team:engineering

- user: user:bob
  relation: member
  object: team:engineering

# Grant team access to document
- user: team:engineering#member
  relation: editor
  object: document:roadmap
```

Both Anne and Bob can edit the roadmap through their team membership.

**Important:** `team#member` means "members of a specific team". It does NOT mean "must be a team member to be an editor". Only use it when assigning access to a group.

### 2.5 Conditional Relationships

**Impact: MEDIUM (dynamic authorization)**

Conditions use CEL (Common Expression Language) to add runtime context to authorization decisions.

**Example: time-based access**

```dsl.openfga
model
  schema 1.1

type user

type organization
  relations
    define admin: [user with non_expired_grant]

condition non_expired_grant(current_time: timestamp, grant_time: timestamp, grant_duration: duration) {
  current_time < grant_time + grant_duration
}
```

**Conditional tuple:**

```yaml
- user: user:peter
  relation: admin
  object: organization:acme
  condition:
    name: non_expired_grant
    context:
      grant_time: "2024-02-01T00:00:00Z"
      grant_duration: 1h
```

**Check with context:**

```yaml
check:
  - user: user:peter
    object: organization:acme
    context:
      current_time: "2024-02-01T00:10:00Z"
    assertions:
      admin: true
```

Conditions must be defined at the end of the model, after all type definitions.

### 2.6 Wildcards for Public Access

**Impact: LOW (use carefully)**

Wildcards (`type:*`) grant access to all objects of a type.

**Example: public documents**

```dsl.openfga
type document
  relations
    define viewer: [user, user:*]
```

**Tuple for public access:**

```yaml
- user: user:*
  relation: viewer
  object: document:public-readme
```

All users can view the public-readme document.

**Use sparingly:** Wildcards should be reserved for genuinely public resources. Prefer explicit grants or group-based access for most scenarios.

---

## 3. Model Design Patterns

**Impact: HIGH**

Design patterns that lead to maintainable and correct authorization models.

### 3.1 Define Permissions with can_ Relations

**Impact: HIGH (clear permission semantics)**

Define specific permissions using `can_<action>` relations that cannot be directly assigned.

**Incorrect: checking relations directly**

```dsl.openfga
type document
  relations
    define owner: [user]
    define editor: [user] or owner
    define viewer: [user] or editor
```

Application checks `editor` relation but semantics are unclear.

**Correct: explicit permissions**

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

Now the application checks `can_view`, `can_edit`, etc. with clear semantics.

**Benefits:**
- Clear separation between roles and permissions
- Permissions can combine multiple roles
- Easier to evolve without breaking applications

### 3.2 Hierarchical Structures

**Impact: HIGH (scalable permission inheritance)**

Model parent-child relationships to enable permission inheritance through hierarchies.

**Example: folder hierarchy**

```dsl.openfga
type folder
  relations
    define parent_folder: [folder]
    define owner: [user] or owner from parent_folder
    define editor: [user] or owner or editor from parent_folder
    define viewer: [user] or editor or viewer from parent_folder

type document
  relations
    define parent_folder: [folder]
    define owner: [user] or owner from parent_folder
    define editor: [user] or owner or editor from parent_folder
    define viewer: [user] or editor or viewer from parent_folder
```

**Tuples:**

```yaml
# Nested folder structure
- user: folder:root
  relation: parent_folder
  object: folder:engineering

- user: folder:engineering
  relation: parent_folder
  object: folder:backend

# Document in nested folder
- user: folder:backend
  relation: parent_folder
  object: document:api-spec

# Grant access at root
- user: user:cto
  relation: viewer
  object: folder:root
```

The CTO can view all documents in all nested folders with a single tuple.

### 3.3 Organization-Level Access

**Impact: HIGH (multi-tenant authorization)**

Model organization membership and propagate access to owned resources.

**Example:**

```dsl.openfga
type organization
  relations
    define member: [user]
    define admin: [user]

type project
  relations
    define organization: [organization]
    define owner: [user] or admin from organization
    define editor: [user] or owner
    define viewer: [user] or editor or member from organization
```

**Tuples:**

```yaml
# Organization membership
- user: user:anne
  relation: admin
  object: organization:acme

- user: user:bob
  relation: member
  object: organization:acme

# Project belongs to organization
- user: organization:acme
  relation: organization
  object: project:website
```

Anne (admin) can own/edit/view. Bob (member) can view. All through organization membership.

### 3.4 Naming Conventions

**Impact: MEDIUM (maintainability)**

Use consistent naming conventions for clarity and maintainability.

**Types:** Use singular nouns in lowercase
- `user`, `document`, `folder`, `organization`, `team`, `project`

**Relations:** Use descriptive names
- Roles: `owner`, `editor`, `viewer`, `admin`, `member`
- Structural: `parent_folder`, `organization`, `parent`
- Permissions: `can_view`, `can_edit`, `can_delete`, `can_share`

**Objects:** Use meaningful identifiers
- `document:roadmap-2024`
- `organization:acme-corp`
- `folder:engineering-docs`

---

## 4. Testing and Validation

**Impact: HIGH**

Thorough testing ensures your authorization model behaves as expected.

### 4.1 Structure Tests in .fga.yaml

**Impact: HIGH (test-driven authorization)**

The `.fga.yaml` file defines both your model and tests in a single file.

**Structure:**

```yaml
name: My Authorization Model Tests

model: |
  model
    schema 1.1

  type user

  type document
    relations
      define owner: [user]
      define editor: [user] or owner
      define viewer: [user] or editor

tuples:
  - user: user:anne
    relation: owner
    object: document:roadmap

  - user: user:bob
    relation: editor
    object: document:roadmap

tests:
  - name: Document access tests
    check:
      # Test assertions here
    list_objects:
      # List objects assertions here
    list_users:
      # List users assertions here
```

**Alternative: external files**

```yaml
name: Model Tests
model_file: ./model.fga
tuple_file: ./tuples.yaml
```

### 4.2 Check Assertions

**Impact: HIGH (verify permission grants)**

Check assertions verify whether a user has a specific relation to an object.

**Example:**

```yaml
tests:
  - name: Owner permissions
    check:
      - user: user:anne
        object: document:roadmap
        assertions:
          owner: true
          editor: true   # Inherited through concentric relationship
          viewer: true   # Inherited through concentric relationship
          can_delete: true

      - user: user:bob
        object: document:roadmap
        assertions:
          owner: false
          editor: true
          viewer: true
          can_delete: false
```

Always test both positive (has access) and negative (no access) cases.

### 4.3 List Objects Tests

**Impact: MEDIUM (verify object enumeration)**

List objects tests verify which objects a user has access to.

**Example:**

```yaml
tests:
  - name: List accessible documents
    list_objects:
      - user: user:anne
        type: document
        assertions:
          owner:
            - document:roadmap
          viewer:
            - document:roadmap
            - document:public-doc

      - user: user:bob
        type: document
        assertions:
          owner: []  # Empty list - no owned documents
          editor:
            - document:roadmap
```

### 4.4 List Users Tests

**Impact: MEDIUM (verify user enumeration)**

List users tests verify which users have access to an object.

**Example:**

```yaml
tests:
  - name: List document users
    list_users:
      - object: document:roadmap
        user_filter:
          - type: user
        assertions:
          owner:
            users:
              - user:anne
          editor:
            users:
              - user:anne
              - user:bob
          viewer:
            users:
              - user:anne
              - user:bob
```

**User filter formats:**
- `type: user` - List individual users
- `type: team` with `relation: member` - List team usersets

### 4.5 Testing Conditions

**Impact: MEDIUM (verify dynamic authorization)**

Test conditional relationships by providing context in your assertions.

**Example:**

```yaml
model: |
  model
    schema 1.1

  type user

  type resource
    relations
      define viewer: [user with in_allowed_ip_range]

  condition in_allowed_ip_range(user_ip: string, allowed_range: string) {
    user_ip.startsWith(allowed_range)
  }

tuples:
  - user: user:anne
    relation: viewer
    object: resource:internal
    condition:
      name: in_allowed_ip_range
      context:
        allowed_range: "192.168."

tests:
  - name: Conditional access tests
    check:
      - user: user:anne
        object: resource:internal
        context:
          user_ip: "192.168.1.100"
        assertions:
          viewer: true

      - user: user:anne
        object: resource:internal
        context:
          user_ip: "10.0.0.50"
        assertions:
          viewer: false
```

### 4.6 OpenFGA CLI Usage

**Impact: HIGH (validation workflow)**

Use the OpenFGA CLI to validate and test your models.

**Installation:**

```bash
# macOS
brew install openfga/tap/fga

# Docker
docker pull openfga/cli
docker run -it openfga/cli
```

**Commands:**

```bash
# Validate model syntax
fga model validate --file model.fga

# Run tests
fga model test --tests model.fga.yaml

# Transform between formats
fga model transform --input model.fga --output model.json
```

**Example test run:**

```bash
$ fga model test --tests authorization.fga.yaml
# PASSED: Owner permissions
# PASSED: List accessible documents
# PASSED: Conditional access tests
# 3/3 tests passed
```

---

## 5. Custom Roles

**Impact: MEDIUM**

Implement user-defined roles when applications need flexible permission structures.

### 5.1 Simple User-Defined Roles

**Impact: MEDIUM (organization-wide custom roles)**

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

**Adding new permissions:**

When you add `can_delete_project` to the model, existing roles don't automatically get it. Create additional tuples as needed:

```yaml
- user: role:acme-project-admin#assignee
  relation: can_delete_project
  object: organization:acme
```

### 5.2 Role Assignments for Resource-Specific Roles

**Impact: MEDIUM (per-resource role members)**

For roles that can have different members on different resources.

**Model:**

```dsl.openfga
model
  schema 1.1

type user

type role
  relations
    define can_view_project: [user:*]
    define can_edit_project: [user:*]

type role_assignment
  relations
    define assignee: [user]
    define role: [role]

    define can_view_project: assignee and can_view_project from role
    define can_edit_project: assignee and can_edit_project from role

type organization
  relations
    define admin: [user]

type project
  relations
    define organization: [organization]
    define role_assignment: [role_assignment]

    define can_edit_project: can_edit_project from role_assignment or admin from organization
    define can_view_project: can_view_project from role_assignment or admin from organization
```

**Setting up role assignments:**

```yaml
# 1. Define the role's permissions
- user: user:*
  relation: can_view_project
  object: role:project-admin

- user: user:*
  relation: can_edit_project
  object: role:project-admin

# 2. Create role assignment instance with user and role
- user: user:anne
  relation: assignee
  object: role_assignment:project-admin-website

- user: role:project-admin
  relation: role
  object: role_assignment:project-admin-website

# 3. Link role assignment to project
- user: role_assignment:project-admin-website
  relation: role_assignment
  object: project:website

# 4. Link project to organization
- user: organization:acme
  relation: organization
  object: project:website
```

### 5.3 Combining Static and Custom Roles

**Impact: HIGH (practical role systems)**

Combine pre-defined static roles with user-defined custom roles.

**Model:**

```dsl.openfga
type organization
  relations
    # Static roles
    define owner: [user]
    define admin: [user] or owner
    define member: [user] or admin

    # Custom role support
    define can_manage_billing: [role#assignee] or owner
    define can_manage_members: [role#assignee] or admin
    define can_view_analytics: [role#assignee] or member
```

Static roles provide baseline permissions. Custom roles extend them for specific organizational needs.

### 5.4 When to Use Each Pattern

| Pattern | Use Case | Pros | Cons |
|---------|----------|------|------|
| **Simple User-Defined Roles** | Organization-wide roles with consistent permissions | Simple, efficient | Less flexible for per-resource customization |
| **Role Assignments** | Resource-specific roles with different members per resource | Highly flexible | More complex, more tuples |

**Choose simple roles when:**
- Roles apply at the organization level
- Same users have the role everywhere
- Permission structure is straightforward

**Choose role assignments when:**
- Different users need the same role on different resources
- Per-project or per-team role membership varies
- Fine-grained resource-level control is required

---

## 6. Optimization

**Impact: MEDIUM**

Optimize your models for clarity and efficiency.

### 6.1 Simplify Models

**Impact: MEDIUM (maintainability)**

Remove unused types and relations from your model.

**Incorrect: unused relations**

```dsl.openfga
type document
  relations
    define owner: [user]
    define editor: [user]
    define viewer: [user]
    define commenter: [user]  # Never used in application
    define legacy_admin: [user]  # Deprecated, no tuples exist
```

**Correct: minimal model**

```dsl.openfga
type document
  relations
    define owner: [user]
    define editor: [user]
    define viewer: [user]
```

After generating models and tests, audit for types and relations that are not referenced.

### 6.2 Minimize Tuple Count

**Impact: MEDIUM (storage and performance)**

Use indirect relationships to reduce the number of tuples needed.

**Incorrect: tuple explosion**

```yaml
# Granting viewer access to 100 documents individually
- user: user:anne
  relation: viewer
  object: document:doc-1
- user: user:anne
  relation: viewer
  object: document:doc-2
# ... 98 more tuples
```

**Correct: hierarchical access**

```yaml
# Grant folder access once
- user: user:anne
  relation: viewer
  object: folder:engineering

# Documents inherit from folder
- user: folder:engineering
  relation: parent_folder
  object: document:doc-1
# ... link documents to folder
```

One permission tuple plus structural tuples scales better than individual grants.

### 6.3 Type Restrictions

**Impact: LOW (model correctness)**

Apply appropriate type restrictions to prevent invalid tuples.

**Incorrect: overly permissive**

```dsl.openfga
type document
  relations
    define parent: [folder, document, user, organization]  # Too broad
```

**Correct: precise restrictions**

```dsl.openfga
type document
  relations
    define parent_folder: [folder]  # Only folders can be parents
    define organization: [organization]  # Only orgs
    define owner: [user]  # Only users
```

Type restrictions:
- Prevent invalid tuples from being written
- Make the model self-documenting
- Enable better tooling support

---

## References

1. [OpenFGA Documentation](https://openfga.dev/docs)
2. [OpenFGA DSL Reference](https://openfga.dev/docs/configuration-language)
3. [OpenFGA CLI](https://github.com/openfga/cli)
4. [OpenFGA Sample Stores](https://github.com/openfga/sample-stores)
5. [Google Zanzibar Paper](https://research.google/pubs/pub48190/)
