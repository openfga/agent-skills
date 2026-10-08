---
title: Start From the Closest Sample Store
---

## Start From the Closest Sample Store

The [openfga/sample-stores](https://github.com/openfga/sample-stores) repository is maintained by the OpenFGA team. It has 40 example stores, and each one comes with a model, sample tuples, and `.fga.yaml` tests that run in CI. Before you design a model for an application, find the sample store closest to the use case. Use it as a reference for structure, naming, and test coverage.

**Incorrect (designing from scratch and missing a known pattern):**

```fga
model
  schema 1.1

type user

type project
  relations
    define admin: [user]
    define writer: [user] or admin
    define reader: [user] or writer
```

With this model, access has to be granted one user and one project at a time. It has no teams and no organization-wide base permission. The `github` sample store already solves both.

**Correct (adapted from the `github` sample store):**

```fga
model
  schema 1.1

type user

type team
  relations
    define member: [user, team#member]

type organization
  relations
    define owner: [user]
    define member: [user] or owner
    define project_reader: [user, organization#member]
    define project_writer: [user, organization#member]

type project
  relations
    define owner: [organization]
    define admin: [user, team#member]
    define writer: [user, team#member] or admin or project_writer from owner
    define reader: [user, team#member] or writer or project_reader from owner
    define can_push: writer
    define can_read: reader
```

The adapted model makes four changes to the sample:
- It renames `repo` to the application's `project`.
- It drops the `maintainer` and `triager` roles, which the application does not need.
- It keeps nested teams (`team#member`) and organization base roles (`project_reader from owner`).
- It adds `can_*` permissions (see `design-permissions`).

### Pick a Store by Use Case

| You are building | Start from | Pattern it shows |
|------------------|------------|------------------|
| Your first model, step by step | `modeling-guide` | Ten steps, each adding one feature: multi-tenancy, groups, public access, relation-based attributes, super-admins, conditions, custom roles, application access, API access |
| B2B SaaS with tenants and roles | `multitenant-rbac` | Organizations as tenants, nested groups, a fixed `admin` role plus custom roles assigned to users, groups, or other roles |
| Platform staff or support access across tenants | `superadmin` | System admins, service applications, and help-desk access that expires through a condition |
| Customer-defined roles | `custom-roles`, `role-assignments` | Two ways to model user-defined roles (see `roles-when-to-use`) |
| Files, folders, and link sharing | `gdrive`, `file-storage` | Inheritance from parent folders, public access with `user:*`, sharing with `group#member` |
| Source control or a developer platform | `github` | Nested teams and organization-wide base roles |
| Workspaces and channels | `slack`, `chat` | Workspace roles, per-channel write and comment access, conversation membership |
| Plans and feature gating | `entitlements` | Access to features based on the customer's plan |
| Usage limits per plan | `advanced-entitlements` | Conditions that compare usage counts with plan limits |
| Time-limited access | `temporal-access` | A condition based on grant time and duration |
| Network or IP restrictions | `ip-based-access` | An `ipaddress` condition combined with relations through `and` |
| Access based on resource attributes (status, department, region) | `abac-with-rebac`, `groups-resource-attributes`, `condition-data-types` | When to model an attribute as a relation and when as a condition, and every supported condition parameter type |
| AI agents calling MCP tools | `mcp-gateway` | Grants per tool and per tool parameter for users and agents. Uses the experimental Dynamic Conditions feature. |
| One large model owned by several teams | `modular` | `fga.mod` with one module per team (see `design-modules`) |

If no single store matches, combine patterns from several of them, for example `multitenant-rbac` for tenants and `gdrive` for document sharing. Do not force the application into one sample.

### Industry Examples

Each industry store models the main resources of its vertical and includes tuples, tests, and a README that explains the use case.

| Store | Resources modeled |
|-------|-------------------|
| `accounting` | Charts of accounts, invoices, expenses, payments, journal entries |
| `ads` | Campaigns, ad groups, ads, creatives, reports |
| `applicant-tracking-system` | Jobs, candidates, applications, interviews, offers |
| `banking` | Accounts, transactions, transfer limits |
| `calendar` | Calendars, events, scheduling links, recordings, webinars |
| `call-center` | Calls, contacts, comments, recordings |
| `chat` | Conversations, messages, groups, membership |
| `crm` | Accounts, contacts, leads, opportunities, pipeline |
| `developer-portal` | API keys, applications, developer access |
| `ecommerce` | Stores, products, customers, orders, reviews |
| `expenses` | Expense reports, approvals, reimbursements |
| `file-storage` | Drives, folders, files with hierarchical permissions |
| `healthcare` | Patients, encounters, diagnoses, treatments, medications |
| `hospitality` | Hotels, rooms, reservations, guest services |
| `human-resources` | Employees, teams, payroll, benefits, time off |
| `iot` | Devices, device groups, live and recorded video |
| `issue-tracking` | Collections, tickets, comments, attachments |
| `knowledge-base` | Containers, articles, attachments, public content |
| `kms` | Spaces, pages, comments, publishing workflow |
| `lms` | Courses, classes, content, activities, grading |
| `manufacturing` | Production lines, machines, work orders, quality reports |
| `payment` | Payments, payouts, refunds, subscriptions |
| `real-estate` | Properties, listings, transactions, inspections |

### What Is in a Sample Store

Each store lives in `stores/<name>/`. Fetch any file from `https://raw.githubusercontent.com/openfga/sample-stores/main/stores/<name>/<file>`.

- `README.md` describes the use case and requirements. Some READMEs also link a docs page and a Playground (`https://play.fga.dev/sandbox/?store=<name>`).
- `store.fga.yaml` holds the tuples and tests. The model is either inline (`model: |`) or in a separate file named by `model_file` (usually `model.fga`).
- A few stores use a different layout:
  - `modeling-guide` has one `step-*.fga.yaml` file per step.
  - `mcp-gateway` has one `.fga.yaml` file per scenario.
  - `modular` has an `fga.mod` and its module files.

### Production Models From Open Source Adopters

The sample-stores README also links [OpenFGA models used in open source projects](https://github.com/openfga/sample-stores#openfga-models-in-open-source-projects). Read them to see how production systems structure larger models, for example:

- [Grafana](https://github.com/grafana/grafana/tree/main/pkg/services/authz/zanzana/schema)
- [canonical/lxd](https://github.com/canonical/lxd/blob/main/lxd/auth/drivers/openfga_model.openfga) and [lxc/incus](https://github.com/lxc/incus/blob/main/internal/server/auth/driver_openfga_model.openfga)
- [canonical/jimm](https://github.com/canonical/jimm/blob/v3/openfga/authorisation_model.fga)
- [mindersec/minder](https://github.com/mindersec/minder/blob/main/internal/authz/model/minder.fga)
- [theopenlane/core](https://github.com/theopenlane/core/blob/main/fga/model/fga.mod) (modular model)
- [SigNoz](https://github.com/SigNoz/signoz/blob/main/ee/authz/openfgaschema/base.fga)
- [Linux Foundation](https://github.com/linuxfoundation/lfx-v2-helm/blob/main/charts/lfx-platform/files/model.fga)

### Rules

- Adapt a sample; do not copy it. Rename types and relations to the application's domain, drop what the application does not need, and add `can_*` permissions.
- Copy the sample's tests along with its model, and change them as you change the model (see `examples-validate-with-samples`).
- Sample tuples use readable IDs such as `user:anne`. Production tuples should use stable identifiers that contain no personal data.
- Read the store's README before adopting a sample that uses experimental features. For example, `mcp-gateway` needs OpenFGA v1.21.0 or later started with `--experimentals inline_expressions`.
- Sample stores show modeling patterns, not application code. For SDK calls, see `sdk-*`.
