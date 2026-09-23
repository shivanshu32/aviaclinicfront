# Avia Clinic UI audit

## Scope and constraints

This redesign is a frontend-only enhancement. Existing routes, API services, authentication, permissions, calculations, and data contracts remain unchanged. Only modules already present in the application are represented in navigation.

## Existing product surface

- Core: Dashboard, Patients, Appointments, Doctors
- Clinical/financial: OPD billing and consultation, medicine billing, miscellaneous/service billing
- Operations: Pharmacy inventory, Service Charges, Reports
- Administration: Staff/User Management, WhatsApp, Letterhead, Settings
- Not currently implemented as standalone modules: IPD, Laboratory, Departments, Payments, Prescriptions

## Audit findings

### Information architecture

- Navigation is a single ungrouped list, which makes clinical, operations, and administration tools hard to scan.
- Mobile uses the desktop collapsed rail instead of an off-canvas drawer.
- The global header lacks location context, breadcrumbs, search, notifications, and branch context.

### Visual system

- Green, blue, purple, and orange gradients compete for attention and reduce the calm healthcare tone.
- Radius, shadows, typography, field heights, badges, and page headers vary by page.
- Many pages repeat near-identical card, table, loading, and empty-state styles.
- Poppins, Inter, and Plus Jakarta Sans are mixed across controls and headings.

### Workflows

- Dashboard quick actions lead before operational status; urgent appointments and stock alerts should lead.
- Patient and billing lists are functional but scanability suffers from weak column hierarchy.
- Settings uses a dense full-width form and fixed multi-column grids that do not adapt well to mobile.
- Appointment workflow has good existing status progression and billing safeguards; those must be preserved.

### Accessibility and responsive behavior

- Several icon-only buttons rely on `title` rather than explicit accessible labels.
- Focus treatment is inconsistent, and some muted text has low contrast.
- Tables need a reliable small-screen overflow container.
- Modal semantics and focus handling are inconsistent across locally implemented dialogs.

## Design direction

- Inter is the primary typeface; Plus Jakarta Sans is reserved for compact headings.
- Deep teal is the sole brand accent, supported by slate neutrals and restrained semantic colors.
- Cards use 12px radii, soft borders, and minimal shadows.
- A shared application shell, page header, statuses, controls, states, tables, and modal styling provide consistency.
- Motion is limited to 150–200ms transitions and respects reduced-motion preferences.

## Implementation priorities

1. Shared tokens and primitives
2. Responsive application shell, grouped sidebar, compact contextual header
3. Dashboard, patient, appointment, billing, pharmacy, doctor, reports, staff, and settings surfaces
4. Responsive, accessibility, loading/empty/error, visual consistency, and performance verification

## Known risks

- Some status values are API-defined strings. Styling normalizes their presentation but does not rename or mutate them.
- There is no standalone IPD, laboratory, department, payment, or prescription route; adding one would invent functionality and is intentionally out of scope.
- Full authenticated end-to-end verification requires a running backend, database, and valid tenant credentials.
