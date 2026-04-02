# Roles and Permissions

This document describes the logical roles in the SuperStar Influencer Consulting & Marketing Portal. Implementation details (auth, tokens, etc.) can evolve, but the capability matrix should remain consistent.

## Roles

- **Admin / Supervisor**
  - Internal agency role
  - Full access to performance analytics and configuration

- **Influencer** (Planned)
  - External creator account linked to an agency
  - Limited, self-service access to their own data

## Admin / Supervisor Capabilities

- View global metrics (all influencers under the agency)
- Filter metrics by period (daily, weekly, monthly)
- See group / mentor performance tables
- See influencer lists and details
- (Future) Manage agency settings and targets

## Influencer Capabilities (Planned)

- Login to the portal using their own credentials
- View only their own performance data
- See simplified KPIs and trends (no cross-influencer comparisons)
- Receive guidance / tips from the agency

## Data Separation

- Admin/Supervisor views: aggregate & comparative data across all influencers.
- Influencer views: only per-creator data, no access to other creators' metrics.
