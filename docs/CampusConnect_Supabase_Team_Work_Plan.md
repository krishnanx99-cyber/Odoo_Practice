# CampusConnect — Supabase Implementation & Team Work Plan

**Document purpose:** Build-ready implementation plan for the current CampusConnect student portal using Supabase, with work divided into parallel tasks suitable for a team/AI-agent workflow.

**Status:** Approved direction for implementation  
**Date:** August 2026  
**Primary goal:** Build a polished, working, deployable CampusConnect MVP while learning real frontend, database, authentication, authorization, and backend concepts without taking on unnecessary infrastructure complexity.

---

# 1. Product Direction

CampusConnect is a college event and resource booking platform.

For the current implementation, the Student Portal is the priority.

The student experience follows four simple concepts:

- **Home → Discover**
- **Detail → Understand**
- **Booking → Request**
- **My Bookings → Track**

Current student-facing pages:

1. Home
2. Event Detail
3. Resource Detail
4. Resource Booking
5. My Bookings

Current scope deliberately excludes:

- Calendar page
- Add to Calendar
- Notification center
- Dashboard
- Separate Event Registration page
- Separate Resource Discovery page
- Other unapproved pages/features

The current UI handoff defines the student portal as a single Home page with Events and Resources tabs, detail pages for events/resources, a resource booking flow, and My Bookings. It also requires responsive interactions and inline availability validation. 

---

# 2. Why Supabase

The project is being built primarily for practice, learning, and portfolio value. The team does not currently want to manage production infrastructure such as:

- self-hosted PostgreSQL
- Express backend deployment
- Redis
- Docker production infrastructure
- AWS/S3 setup
- Nginx
- load balancers
- Kubernetes
- email/SMS infrastructure

Therefore, the initial architecture will use Supabase as the managed backend platform.

This does NOT mean avoiding backend learning.

Supabase gives the team real experience with:

- PostgreSQL
- SQL
- relational database design
- authentication
- authorization
- Row Level Security (RLS)
- CRUD operations
- database constraints
- storage
- API/database communication
- realtime capabilities when needed

Later, a custom TypeScript/Express backend can be introduced as a separate learning phase.

---

# 3. Initial Architecture

```text
                    CAMPUSCONNECT
                         |
                         v
              +---------------------+
              | React + TypeScript  |
              | Student Portal      |
              | Admin Portal        |
              +----------+----------+
                         |
                  Supabase Client
                         |
                         v
              +---------------------+
              |      SUPABASE       |
              |                     |
              | Authentication      |
              | PostgreSQL          |
              | Row Level Security  |
              | Storage             |
              | Realtime (optional) |
              +---------------------+
```

Deployment target:

```text
GitHub
   |
   v
Vercel
   |
   v
React Application
   |
   v
Supabase
```

The initial implementation does NOT require a custom Express API.

---

# 4. Architecture Principles

## 4.1 Keep the infrastructure simple

Do not introduce infrastructure merely because the original long-term specification mentions it.

Do not add:

- Redis
- RabbitMQ/Bull
- AWS S3
- Docker production deployment
- Kubernetes
- SendGrid
- Twilio
- Firebase
- WebSockets

unless a later task explicitly requires them.

## 4.2 Use Supabase properly

The frontend may use the Supabase client with the public/anonymous key.

Never expose:

- Supabase service-role key
- database passwords
- private API keys
- secret tokens

in client-side code.

## 4.3 Security must live in the database

Do not rely only on React UI checks.

Example:

Hiding an "Approve" button from students is NOT authorization.

The database must prevent students from approving bookings.

Use Supabase Row Level Security.

## 4.4 Build the actual MVP first

Do not implement the entire original enterprise specification before the student portal works.

The current goal is:

```text
Authentication
    ↓
Home
    ↓
Events / Resources
    ↓
Details
    ↓
Register OR Book
    ↓
Booking status
    ↓
My Bookings
```

---

# 5. Current Student Workflow

## 5.1 Event Flow

```text
HOME
 ↓
Events Tab
 ↓
Event Cards
 ↓
Details
 ↓
EVENT DETAIL
 ↓
Register
 ↓
Registered
```

There is no separate registration page.

After registration:

```text
[ REGISTER ]
      ↓
[ ✓ REGISTERED ]
```

The UI may show a confirmation message.

No calendar functionality is included.

---

# 6. Resource Workflow

```text
HOME
 ↓
Resources Tab
 ↓
Resource Cards
 ↓
Details
 ↓
RESOURCE DETAIL
 ↓
Book Now
 ↓
RESOURCE BOOKING
 ↓
Select Date + Time
 ↓
Availability Check
 ↓
Enter Booking Details
 ↓
Submit Request
 ↓
PENDING
 ↓
Admin Decision
 ├── APPROVED
 └── REJECTED
 ↓
MY BOOKINGS
```

Direct shortcut:

```text
Home
 ↓
Resources
 ↓
Resource Card
 ↓
Book Now
 ↓
Resource Booking
```

---

# 7. Home Page Requirements

## Navbar

Only:

- CampusConnect logo/name
- Home
- My Bookings
- Logout

Do not add:

- Dashboard
- Calendar
- Notifications
- extra navigation

## Welcome

Example:

```text
Welcome, Nishant 👋
```

## Tabs

```text
[ EVENTS ] [ RESOURCES ]
```

Both are on the same Home page.

## Event filters

- Search
- Category
- Date
- Location
- other useful event filters

## Resource filters

- Search
- Category
- Availability
- Capacity
- Location

## Event cards

Show:

- event image/banner
- event title
- category
- date
- time
- location
- seats/attendee information

## Resource cards

Show:

- resource image
- resource name
- category
- location
- availability
- capacity when relevant

## Card interaction

Desktop:

- subtle expansion on hover
- Details action
- optional Register/Book Now action

Mobile/tablet:

- do not depend on hover
- actions must remain accessible through tap/click

## Empty states

Events:

```text
No events found.
```

Resources:

```text
No resources found.
```

---

# 8. Event Detail Requirements

Show:

- large event image/banner
- title
- category
- date
- start time
- end time
- location
- seats/attendee count
- organizer
- requirements
- full description

Primary action:

```text
REGISTER
```

After success:

```text
✓ REGISTERED
```

No calendar.

---

# 9. Resource Detail Requirements

Show:

- large resource image
- resource name
- category
- description
- location
- capacity
- availability
- booking rules/information

Primary action:

```text
BOOK NOW
```

---

# 10. Resource Booking Requirements

The booking page is only for resource requests.

## Automatically shown

- resource
- category
- location
- availability

Do not make the student re-enter known information.

## Booking details

- date
- start time
- end time
- duration
- quantity when applicable

## Quantity rule

Quantity appears only for resources supporting multiple units.

Example:

```text
Projector
Quantity: [ 2 ]
```

For:

- classroom
- lab
- sports ground

quantity is unnecessary.

## Availability validation

Availability must be checked inline.

Example:

```text
20 Aug
10:00 AM — 12:00 PM

✓ Available
```

Unavailable:

```text
20 Aug
10:00 AM — 12:00 PM

✕ Not available
This resource is already booked during this time.
```

The system must prevent overlapping bookings.

Do not create a separate availability/calendar page.

## Request details

- booking reason
- special requirements/notes

## Student information

Automatically display:

- student name
- email
- department

## Summary

Before submission show:

- resource
- date
- time
- duration
- quantity if relevant
- reason
- relevant details

Actions:

```text
CANCEL
SUBMIT BOOKING REQUEST
```

After submission:

```text
status = pending
```

---

# 11. Booking Status Model

Supported statuses:

```text
pending
approved
rejected
cancelled
completed
```

Expected transitions:

```text
PENDING
 ├── APPROVED
 ├── REJECTED
 └── CANCELLED

APPROVED
 ├── COMPLETED
 └── CANCELLED
```

Students should not be able to arbitrarily change booking status.

Status changes must be controlled by authorized logic/RLS.

---

# 12. My Bookings Requirements

My Bookings primarily tracks resource bookings.

## Active bookings

Each booking can show:

- resource image
- resource name
- category
- location
- date
- start time
- end time
- duration
- quantity
- status
- reason when useful

## Actions

Pending:

```text
Edit
Cancel
```

Approved:

```text
View Details
Cancel
```

Rejected:

```text
View Reason
```

Cancelled:

```text
View
```

Completed:

```text
View Details
```

## Rejection reason

Never show only:

```text
Rejected
```

Show:

```text
Booking Rejected

Reason:
The auditorium is reserved for another event.
```

## History

Show older/completed bookings separately.

---

# 13. Database Direction

Initial database should be intentionally smaller than the full enterprise schema.

Recommended first tables:

```text
profiles
events
event_registrations
resources
bookings
locations
```

Add later only when required:

```text
departments
resource_availability
resource_blackout_dates
notifications
audit_logs
notification_preferences
```

---

# 14. Initial Database Model

## profiles

Purpose: application profile associated with Supabase Auth user.

Suggested fields:

```text
id UUID PRIMARY KEY
full_name
email
department
role
avatar_url
created_at
updated_at
```

Roles:

```text
student
admin
```

A super-admin role should not be introduced until needed.

## events

Suggested fields:

```text
id UUID PRIMARY KEY
title
description
category
organizer_id
location_id
start_time
end_time
capacity
registered_count
status
image_url
requirements
created_at
updated_at
```

Event status:

```text
draft
published
cancelled
completed
```

Only published events appear in normal student discovery.

## event_registrations

Suggested fields:

```text
id UUID PRIMARY KEY
event_id
user_id
status
registered_at
cancelled_at
```

Important constraint:

```text
UNIQUE(event_id, user_id)
```

This prevents duplicate registration.

## resources

Suggested fields:

```text
id UUID PRIMARY KEY
name
description
category
location_id
capacity
quantity_available
owner_id
image_url
status
min_booking_hours
max_booking_hours
advance_notice_hours
requires_approval
created_at
updated_at
```

Resource status:

```text
active
inactive
maintenance
```

## bookings

Suggested fields:

```text
id UUID PRIMARY KEY
resource_id
user_id
start_time
end_time
quantity
status
booking_reason
special_requirements
approved_by
approved_at
rejection_reason
rejected_at
cancelled_at
created_at
updated_at
```

## locations

Suggested fields:

```text
id UUID PRIMARY KEY
name
building_name
floor
room_number
capacity
description
created_at
```

---

# 15. Critical Database Rules

The database must enforce important business rules.

## Rule 1 — One event registration per student

```text
UNIQUE(event_id, user_id)
```

## Rule 2 — Students only see their own private bookings

RLS must enforce this.

## Rule 3 — Students cannot approve bookings

RLS/database permissions must enforce this.

## Rule 4 — Students can modify only their own pending bookings

A student must not modify:

- another student's booking
- an approved booking through the pending-edit operation
- a rejected booking

## Rule 5 — Students can cancel only permitted bookings

The exact cancellation policy can initially be simple.

## Rule 6 — Published events are discoverable

Draft events must not appear to normal students.

## Rule 7 — Active resources are discoverable

Inactive/maintenance resources should not be bookable.

## Rule 8 — Booking end time must be after start time

Invalid:

```text
10:00 → 09:00
```

## Rule 9 — Quantity must be positive

```text
quantity >= 1
```

## Rule 10 — Overlapping bookings must be prevented

This is a critical business rule.

Do not rely solely on:

```text
frontend availability check
```

because two users can submit at nearly the same time.

The final protection must happen in trusted database/server-side logic.

---

# 16. Availability Logic

For a resource booking request:

```text
resource_id
start_time
end_time
quantity
```

The system must check existing bookings.

At minimum, consider bookings with:

```text
status = approved
```

For systems where pending requests reserve capacity, pending may also need to be considered.

The exact policy must be decided before implementation of the booking engine.

Basic overlap condition:

```text
existing.start_time < requested.end_time
AND
existing.end_time > requested.start_time
```

If overlapping bookings are not allowed, reject the request.

For quantity-based resources, the logic should eventually consider total quantity booked during overlapping periods.

Example:

```text
Projectors available = 5

Existing:
2 projectors booked

Student requests:
3 projectors

Result:
Allowed
```

But:

```text
Existing:
4 projectors booked

Student requests:
3 projectors

Result:
Not available
```

For rooms/facilities with one physical resource, treat capacity as a single bookable unit unless the data model explicitly supports partial allocation.

---

# 17. Authentication

Use Supabase Auth.

Initial flow:

```text
Student
 ↓
Login
 ↓
Supabase Auth
 ↓
Authenticated session
 ↓
Profile
 ↓
Student Home
```

The application should obtain the authenticated user's ID from the Supabase session.

Do not trust a user ID supplied by the client for ownership decisions.

Ownership should come from the authenticated session/database policies.

---

# 18. Authorization

Use Supabase Row Level Security.

Conceptually:

## Student

Can:

```text
READ published events
READ active resources
READ locations needed for discovery
CREATE own event registration
READ own registrations
CREATE own booking
READ own bookings
UPDATE own pending booking
CANCEL own permitted booking
```

Cannot:

```text
READ another student's private booking data
APPROVE bookings
REJECT bookings
EDIT other users' data
EDIT published event data
CREATE admin resources/events unless explicitly authorized
```

## Admin

Can:

```text
MANAGE resources
MANAGE events
VIEW bookings
APPROVE bookings
REJECT bookings
CANCEL bookings when authorized
VIEW relevant users
```

Admin policies must be tested, not merely assumed.

---

# 19. Storage

Use Supabase Storage for:

```text
event images
resource images
```

Recommended structure:

```text
event-images/
resource-images/
```

Do not store large image binaries directly in PostgreSQL.

Store the resulting public/signed URL or storage path in the relevant table.

---

# 20. Seed Data

The project should have development seed data.

Create enough data to make the UI realistic.

Example:

Events:

```text
Hackathon 2026
AI Workshop
Tech Seminar
Coding Competition
```

Resources:

```text
Projector
Seminar Hall
Computer Lab
Sports Ground
Camera
Audio System
```

Locations:

```text
Main Auditorium
Block A
Block B
Computer Center
Sports Complex
```

Create multiple statuses and availability conditions so the UI can be tested.

---

# 21. Admin Scope

The long-term product includes a large admin dashboard.

For the current implementation, the admin side should be kept small enough to support the student flow.

Minimum admin functionality:

```text
Admin
 ↓
View pending bookings
 ↓
Open booking
 ├── Approve
 └── Reject + reason
```

Optional next admin features:

```text
Manage events
Manage resources
View users
View booking history
```

Do not build the complete analytics/reporting system yet.

---

# 22. Team Workflow

The project will use a task-based team workflow.

Each task should be:

- independently understandable
- small enough for one agent/developer
- assigned to one branch
- independently testable
- merged through pull request
- free of unnecessary overlap

Recommended branch pattern:

```text
main
│
├── feat/task-001-project-scaffold
├── feat/task-002-supabase-setup
├── feat/task-003-database-schema
├── feat/task-004-auth
├── feat/task-005-home-events
├── feat/task-006-home-resources
├── feat/task-007-event-detail
├── feat/task-008-resource-detail
├── feat/task-009-booking
├── feat/task-010-my-bookings
└── ...
```

The exact branch naming convention can follow the team's existing workflow if already established.

---

# 23. Task Division Strategy

Work should be divided by dependency boundaries.

Do NOT give several agents tasks that modify the same files/components simultaneously.

A good division is:

```text
FOUNDATION
   ↓
DATABASE
   ↓
AUTH
   ↓
DISCOVERY
   ↓
DETAIL
   ↓
BOOKING
   ↓
MY BOOKINGS
   ↓
ADMIN
   ↓
TESTING
   ↓
DEPLOYMENT
```

Some independent UI work can happen in parallel after the design system and routing are stable.

---

# 24. Proposed Task Breakdown

## Phase 0 — Project Understanding

### TASK-001 — Project audit and implementation baseline

Goal:

Understand the existing repository and determine what already exists.

Deliver:

- current stack
- current folder structure
- current routes
- existing UI components
- existing design system
- current dependencies
- current tests
- known gaps

Do not redesign or rewrite existing work unnecessarily.

Dependencies:

```text
None
```

---

# 25. Phase 1 — Foundation

## TASK-002 — Frontend architecture

Build/verify:

- React + TypeScript application structure
- routing
- environment variable structure
- reusable layout
- error boundary strategy
- loading states
- basic route protection structure

Dependencies:

```text
TASK-001
```

## TASK-003 — Supabase client setup

Implement:

- Supabase project configuration
- frontend Supabase client
- environment variables
- typed access pattern
- no secret/service-role key in frontend

Dependencies:

```text
TASK-001
```

## TASK-004 — Design system integration

Implement/verify:

- existing Stitch design
- typography
- colors
- spacing
- cards
- buttons
- inputs
- badges
- loading states
- empty states
- responsive layout

Do NOT redesign the visual language.

The existing UI handoff explicitly says to continue the existing Stitch design and not redesign the visual language from scratch.

Dependencies:

```text
TASK-001
```

---

# 26. Phase 2 — Database

## TASK-005 — Initial Supabase schema

Create:

```text
profiles
events
event_registrations
resources
bookings
locations
```

Include:

- UUIDs
- foreign keys
- timestamps
- constraints
- useful indexes
- status fields

Dependencies:

```text
TASK-003
```

## TASK-006 — RLS and authorization policies

Implement policies for:

- student
- admin

Test:

- own booking access
- other-user booking denial
- event discovery
- resource discovery
- registration ownership
- admin approval/rejection permissions

Dependencies:

```text
TASK-005
```

## TASK-007 — Seed/development data

Create development data for:

- users/profiles
- events
- resources
- locations
- bookings
- registrations

Include enough variation for empty, available, pending, approved, rejected and completed states.

Dependencies:

```text
TASK-005
```

---

# 27. Phase 3 — Authentication

## TASK-008 — Student authentication

Implement:

- login
- logout
- session persistence
- protected routes
- authenticated user profile
- basic auth error handling

Dependencies:

```text
TASK-003
TASK-005
TASK-006
```

## TASK-009 — Role-based route protection

Implement:

```text
student routes
admin routes
```

Ensure a student cannot access admin functionality merely by navigating to an admin URL.

Dependencies:

```text
TASK-006
TASK-008
```

---

# 28. Phase 4 — Home / Discovery

These can be parallelized if they do not modify the same components.

## TASK-010 — Home shell and navigation

Implement:

- navbar
- welcome message
- tabs
- responsive layout
- Home routing

Dependencies:

```text
TASK-002
TASK-004
TASK-008
```

## TASK-011 — Events discovery

Implement:

- event fetching
- event cards
- event grid
- search
- category filter
- date filter
- location filter
- empty state
- loading state

Only published events should be visible.

Dependencies:

```text
TASK-005
TASK-010
```

## TASK-012 — Resources discovery

Implement:

- resource fetching
- resource cards
- availability indicator
- search
- category filter
- availability filter
- capacity filter
- location filter
- empty state
- loading state

Only bookable/active resources should be presented as available.

Dependencies:

```text
TASK-005
TASK-010
```

---

# 29. Phase 5 — Details

## TASK-013 — Event detail

Implement:

- route
- event fetch by ID
- complete event information
- register action
- registered state
- registration success/error states

Prevent duplicate registrations.

Dependencies:

```text
TASK-005
TASK-006
TASK-011
```

## TASK-014 — Resource detail

Implement:

- route
- resource fetch
- complete resource information
- availability state
- booking rules
- Book Now action

Dependencies:

```text
TASK-005
TASK-006
TASK-012
```

---

# 30. Phase 6 — Resource Booking

This is a critical phase and should receive focused implementation/testing.

## TASK-015 — Booking form

Implement:

- resource summary
- date selection
- start time
- end time
- duration
- conditional quantity
- reason
- special requirements
- student information
- booking summary
- cancel
- submit

Dependencies:

```text
TASK-014
TASK-008
```

## TASK-016 — Availability validation

Implement:

- overlap detection
- resource status validation
- booking rule validation
- minimum duration
- maximum duration
- advance notice
- quantity availability where relevant

The UI must show:

```text
✓ Available
```

or:

```text
✕ Not available
```

Dependencies:

```text
TASK-005
TASK-006
TASK-015
```

## TASK-017 — Secure booking creation

Implement the final booking creation path.

Requirements:

- authenticated user ownership
- validation
- correct pending status
- no unauthorized status manipulation
- race-condition-safe overlap protection
- meaningful errors

Dependencies:

```text
TASK-006
TASK-016
```

---

# 31. Phase 7 — My Bookings

## TASK-018 — My Bookings page

Implement:

- active bookings
- booking history
- status badges
- loading state
- empty state

Dependencies:

```text
TASK-017
```

## TASK-019 — Booking actions

Implement:

Pending:

```text
Edit
Cancel
```

Approved:

```text
View
Cancel
```

Rejected:

```text
View reason
```

Cancelled:

```text
View
```

Completed:

```text
View
```

Dependencies:

```text
TASK-018
```

## TASK-020 — Booking detail/status UX

Improve:

- rejection reason
- booking summary
- status transitions
- confirmation messages
- error states

Dependencies:

```text
TASK-019
```

---

# 32. Phase 8 — Minimal Admin Workflow

## TASK-021 — Admin pending bookings

Implement:

- pending booking list
- booking details
- student/requestor information
- resource
- date/time
- quantity
- reason
- special requirements

Dependencies:

```text
TASK-006
TASK-017
```

## TASK-022 — Admin approval/rejection

Implement:

```text
Approve
Reject + reason
```

Ensure only admins can perform these actions.

Dependencies:

```text
TASK-021
```

## TASK-023 — Admin resource/event management

Only implement after the core student workflow is stable.

Possible scope:

- create resource
- edit resource
- create event
- edit event
- publish/cancel

Dependencies:

```text
TASK-022
```

---

# 33. Phase 9 — Testing

## TASK-024 — Database/RLS security tests

Test:

- student isolation
- admin access
- unauthorized booking changes
- duplicate registration
- invalid booking times
- overlapping bookings
- inactive resources
- draft events

Dependencies:

```text
TASK-006
TASK-017
```

## TASK-025 — Frontend component tests

Test:

- cards
- filters
- forms
- status badges
- empty states
- loading states

Dependencies:

```text
TASK-011
TASK-012
TASK-015
TASK-018
```

## TASK-026 — End-to-end student flow

Test:

```text
Login
 ↓
Home
 ↓
Event
 ↓
Register
 ↓
Resource
 ↓
Book
 ↓
Pending
 ↓
My Bookings
```

Dependencies:

```text
TASK-020
TASK-022
```

---

# 34. Phase 10 — Deployment

## TASK-027 — Supabase production configuration

Verify:

- production project
- schema/migrations
- RLS
- storage policies
- environment variables
- seed strategy

Dependencies:

```text
TASK-024
```

## TASK-028 — Vercel deployment

Deploy frontend.

Verify:

- environment variables
- routing
- authentication redirects
- production Supabase connection
- mobile responsiveness

Dependencies:

```text
TASK-027
```

## TASK-029 — Production smoke test

Test:

```text
Login
Home
Event details
Event registration
Resource details
Booking
Availability
My Bookings
Admin approval
```

Dependencies:

```text
TASK-028
```

---

# 35. Phase 11 — Polish

## TASK-030 — UX polish

Review:

- loading states
- empty states
- errors
- success confirmations
- responsive behavior
- hover/tap interactions
- accessibility
- form validation
- button states
- skeletons where useful

Dependencies:

```text
TASK-029
```

## TASK-031 — Final documentation

Document:

- architecture
- local setup
- Supabase setup
- database schema
- RLS strategy
- environment variables
- deployment
- test accounts
- known limitations
- future roadmap

Dependencies:

```text
TASK-030
```

---

# 36. Parallelization Plan

Do not make everything sequential.

A useful team execution graph is:

```text
TASK-001
   |
   +------------------+------------------+
   |                  |                  |
   v                  v                  v
TASK-002          TASK-003          TASK-004
   |                  |
   |                  v
   |              TASK-005
   |                  |
   |                  v
   |              TASK-006
   |                  |
   |             +----+----+
   |             |         |
   |             v         v
   |          TASK-007   TASK-008
   |                        |
   |                        v
   |                     TASK-009
   |                        |
   +------------+-----------+
                |
                v
             TASK-010
             /       \
            v         v
       TASK-011    TASK-012
          |           |
          v           v
       TASK-013    TASK-014
                       |
                       v
                   TASK-015
                       |
                       v
                   TASK-016
                       |
                       v
                   TASK-017
                       |
                       v
                   TASK-018
                       |
                       v
                   TASK-019
                       |
                       v
                   TASK-020
                       |
             +---------+---------+
             |                   |
             v                   v
         TASK-021            TASK-024
             |
             v
         TASK-022
             |
             v
         TASK-023

Testing can continue in parallel
once corresponding features exist.

Final:
TASK-027 → TASK-028 → TASK-029 → TASK-030 → TASK-031
```

---

# 37. Team Agent Rules

Every agent must follow these rules.

## Rule 1 — Read before modifying

Before changing code:

- inspect repository
- inspect relevant existing components
- inspect current branch/state
- understand current architecture
- identify dependencies

Do not overwrite working implementation blindly.

## Rule 2 — One task, one responsibility

Do not expand the task into unrelated features.

If an agent discovers another required change:

- document it
- create/follow a separate task if appropriate
- do not silently scope-creep

## Rule 3 — Avoid overlapping files

If two agents need the same file, coordinate dependencies instead of having both rewrite it.

Prefer shared foundations to be merged first.

## Rule 4 — Test before completion

Every task should provide:

```text
Implementation
+
Tests
+
Verification
```

where applicable.

## Rule 5 — Do not commit secrets

Never commit:

```text
.env
service-role keys
database passwords
API secrets
tokens
private credentials
```

## Rule 6 — Do not use service-role keys in frontend

This is a hard security rule.

## Rule 7 — Do not bypass RLS

If something doesn't work because of RLS:

- understand the policy
- fix the policy or trusted server-side logic
- never disable RLS just to make the feature work

## Rule 8 — Preserve the existing design

The UI handoff explicitly requires continuing the existing Stitch design system.

Do not redesign the application from scratch.

---

# 38. Definition of Done for Every Task

A task is complete only when:

- implementation exists
- relevant tests exist or existing tests pass
- lint/type checks pass where applicable
- no secrets are committed
- no unrelated changes are included
- existing functionality still works
- task-specific behavior is manually verified when appropriate
- commit message clearly describes the change
- branch is ready for PR/review

---

# 39. Pull Request Expectations

Every PR should explain:

```text
TASK
TASK-XXX

WHAT WAS BUILT
...

FILES/AREAS
...

TESTING
...

MANUAL VERIFICATION
...

KNOWN LIMITATIONS
...

DEPENDENCIES
...
```

The PR should not contain unrelated refactors.

---

# 40. Environment Variables

Frontend should have something equivalent to:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Never:

```text
VITE_SUPABASE_SERVICE_ROLE_KEY=
```

The exact framework/environment naming should follow the actual repository.

---

# 41. Migration Strategy

Database changes should be represented as migrations rather than being manually performed without tracking.

The repository should have a clear database migration workflow.

Conceptually:

```text
Migration 001
profiles/events/resources

Migration 002
bookings

Migration 003
RLS policies

Migration 004
indexes/constraints
```

The exact Supabase CLI workflow should be determined from the repository setup.

---

# 42. What We Are NOT Building Yet

The following remain future work unless explicitly promoted:

## Infrastructure

- Express production server
- Redis
- message queues
- Kubernetes
- AWS infrastructure
- CDN architecture
- load balancers

## Communication

- email notification system
- SMS
- push notifications

## Advanced features

- calendar
- waitlists
- QR check-in
- AI recommendations
- analytics
- custom reports
- payment integration
- mobile app
- advanced ML predictions

## Enterprise features

- complex multi-level approval workflows
- advanced audit system
- organization-wide SIS integration
- complex permission matrix

The original specification contains many of these features as long-term requirements, but they are intentionally outside the current MVP.

---

# 43. Future Backend Learning Path

After CampusConnect works on Supabase, the team can create a second branch/project phase:

```text
CURRENT

React
 ↓
Supabase


FUTURE

React
 ↓
Express + TypeScript
 ↓
Supabase/PostgreSQL
```

Then progressively move:

```text
Authentication logic
Booking API
Availability engine
Admin approval API
Validation
Business logic
```

behind the custom backend.

This gives the team a real reason to learn backend engineering.

---

# 44. Success Criteria for Current MVP

The MVP is successful when a student can:

```text
1. Login
2. See Home
3. Browse Events
4. Search/filter Events
5. Open Event Detail
6. Register for an Event
7. See Registered state
8. Browse Resources
9. Search/filter Resources
10. Open Resource Detail
11. Start Booking
12. Select date/time
13. See availability
14. Submit booking request
15. See Pending status
16. Open My Bookings
17. Edit/cancel permitted booking
18. See rejection reason
19. See booking history
```

And an admin can:

```text
1. Login
2. View pending bookings
3. Open booking details
4. Approve
5. Reject with reason
```

The system must also prevent unauthorized access and overlapping bookings.

---

# 45. Final Technical Direction

The team should NOT think:

> "We are using Supabase because we don't know backend."

Think:

> "We are using Supabase to remove infrastructure overhead while learning real database, authentication, authorization, and application architecture concepts. Once the product is stable, we can introduce our own backend as a second learning phase."

This is the recommended development direction.

---

# 46. First Implementation Order

If the team is starting now, begin with:

```text
TASK-001
Project audit
       ↓
TASK-002
Frontend architecture
       ↓
TASK-003
Supabase setup
       ↓
TASK-004
Design system integration
       ↓
TASK-005
Database schema
       ↓
TASK-006
RLS
       ↓
TASK-007
Seed data
       ↓
TASK-008
Authentication
       ↓
TASK-010
Home shell
       ↓
TASK-011 + TASK-012
Events + Resources
       ↓
TASK-013 + TASK-014
Details
       ↓
TASK-015
Booking form
       ↓
TASK-016
Availability
       ↓
TASK-017
Secure booking
       ↓
TASK-018 + TASK-019
My Bookings
       ↓
TASK-021 + TASK-022
Admin approval
       ↓
Testing
       ↓
Deployment
```

This should be the baseline task graph for the team.

---

# 47. Instruction to the Coding Agent

The coding agent should use this document as the implementation source of truth for the current CampusConnect phase.

It should:

1. Inspect the existing repository first.
2. Preserve existing working code and design.
3. Break work into TASK-XXX units.
4. Identify dependencies before assigning tasks.
5. Keep tasks independently testable.
6. Avoid overlapping file ownership between parallel tasks.
7. Use Supabase for the initial backend platform.
8. Implement PostgreSQL schema and RLS correctly.
9. Treat booking overlap prevention as a critical business rule.
10. Never expose service-role credentials.
11. Keep the current Student Portal scope intact.
12. Do not introduce calendar, notifications, dashboard, or other excluded functionality without explicit approval.
13. Create small, reviewable PRs.
14. Test every feature before marking the task complete.
15. Maintain a clean main branch.

The product should be developed incrementally rather than attempting the entire specification in one implementation pass.
