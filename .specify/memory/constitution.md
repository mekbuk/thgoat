<!--
Sync Impact Report
Version change: None (Initial Template) → 1.0.0
List of modified principles:
  - Initial creation replacing all template placeholders with concrete Throat Goat project constitution.
Added sections:
  - I. Simplicity & Functional MVP First (Anti-Overengineering)
  - II. Modular Architecture & Decoupled Canvas
  - III. Zero-Trust Server Validation & Security
  - IV. Two-Tier Data Persistence & Storage Optimization
  - V. End-to-End TypeScript & Code Clarity
  - VI. Responsive, Touch-Friendly & Meme-Inspired UX
  - VII. Future-Proof Extensibility for Multiplayer & Real-Time
  - VIII. Test Discipline & Quality Gates
  - Technology Stack & Runtime Standards
  - Storage & Security Policies
  - Governance & Compliance
Removed sections:
  - Generic placeholders ([PRINCIPLE_1_NAME], etc.)
Templates requiring updates:
  - .specify/templates/plan-template.md (✅ aligned)
  - .specify/templates/spec-template.md (✅ aligned)
  - .specify/templates/tasks-template.md (✅ aligned)
Follow-up TODOs:
  - None
-->

# Throat Goat Constitution

## Core Principles

### I. Simplicity & Functional MVP First
- The initial product MUST deliver a complete, delightful, single-player drawing and sharing experience before any secondary or multiplayer feature is introduced.
- Features MUST NOT be added based on hypothetical future needs (YAGNI). Every component, API route, and state slice in the MVP must directly serve the core drawing, submission, retrieval, or viewing workflows.
- Premature optimization is strictly prohibited; developers MUST prioritize readable, maintainable, and straightforward TypeScript implementations over speculative abstractions.

### II. Modular Architecture & Decoupled Canvas
- The system MUST maintain strict separation of concerns across four distinct layers:
  1. **Presentation / UI Layer**: React components handling layout, toolbar interactions, modals, and meme-themed styling.
  2. **Drawing Engine Layer**: Canvas lifecycle, pointer/touch event handling, stroke rendering, undo/redo history stack, and export utilities (e.g., Konva.js/HTML5 Canvas).
  3. **Data Access & Persistence Layer**: Server actions/API routes, database queries, and object-storage adapters.
  4. **Multiplayer & Real-Time Engine (Future Phase)**: Isolated room management, websocket/presence synchronization, timers, and round coordination.
- The drawing canvas MUST NOT have direct knowledge of or coupling to database schemas, network APIs, or authentication state. Communication between the canvas and backend MUST happen through explicitly typed service interfaces and data transfer objects (DTOs).

### III. Zero-Trust Server Validation & Security
- The server MUST NOT trust any client-provided metadata, timestamps, image dimensions, or file headers.
- All user-submitted payloads (canvas data, export files, metadata, titles, tags) MUST be validated on the server using strict runtime schemas (e.g., Zod) before storage or database persistence.
- Image uploads MUST be validated for MIME type, file size limits, and binary integrity on the server to prevent malicious file uploads or denial-of-service via oversized payloads.
- Rate limiting SHOULD be enforced on drawing submission endpoints to prevent spam and abuse.

### IV. Two-Tier Data Persistence & Storage Optimization
- Drawing binary image data (e.g., PNG/WebP exports) MUST NEVER be stored directly as raw byte arrays or blobs inside PostgreSQL tables.
- The application MUST use a two-tier storage architecture:
  1. **Relational Database (PostgreSQL / Supabase)**: Stores structured metadata (drawing ID, creator info/session, timestamps, storage URLs/keys, stroke count, status).
  2. **Object / File Storage (Supabase Storage / S3-compatible)**: Stores the actual image binary artifacts.
- The object storage access layer MUST be abstracted behind an adapter interface to allow seamless migration between storage providers (e.g., Supabase Storage to AWS S3, Cloudflare R2, or MinIO) without changing application business logic.
- Client drawings MUST be optimized before or during upload (e.g., target dimensions, WebP/PNG compression, reasonable file size budget < 2MB per drawing).

### V. End-to-End TypeScript & Code Clarity
- TypeScript MUST be used across the entire codebase with `strict` mode enabled. No `any` types are permitted without explicit, documented justification.
- Shared domain models, API contracts, drawing event payloads, and storage schemas MUST be defined in centralized types/contracts packages or directories.
- Code readability, clear naming conventions, and self-documenting code structures MUST take precedence over clever one-liners or unnecessary meta-programming.

### VI. Responsive, Touch-Friendly & Meme-Inspired UX
- The drawing canvas MUST be prominently centered and fully responsive across both desktop (mouse) and mobile/tablet (touch/stylus) viewports.
- The drawing interface MUST support essential creation tools: brush color palette, adjustable brush size, eraser, canvas clear with confirmation, undo/redo capabilities, and a clear submit action.
- The visual identity MUST embrace a humorous, tongue-in-cheek aesthetic inspired by the "Throat Goat" meme while maintaining clean usability, accessible contrast, and smooth 60fps drawing responsiveness.
- Submitted drawings MUST be instantly retrievable and viewable in a gallery or drawing viewer without loss of state across page reloads.

### VII. Future-Proof Extensibility for Multiplayer & Real-Time
- While the initial MVP is strictly single-player drawing + persistence + gallery, the codebase MUST be architected to allow the incremental addition of multiplayer rooms, prompts, turn-based rounds, timers, and real-time canvas sync.
- State machines and drawing stroke representations SHOULD be designed with serializable vector/stroke formats so live canvas synchronization (e.g., WebSockets / Supabase Realtime) can be layered in without rewriting the drawing engine.

### VIII. Test Discipline & Quality Gates
- Every user story MUST be independently testable with clear acceptance criteria.
- Critical path business logic (canvas stroke serialization, export helpers, server validation schemas, storage adapters, and API endpoints) MUST have automated unit and integration tests.
- Test suites MUST execute cleanly in CI/CD before merging changes to main branches.

## Technology Stack & Runtime Standards

- **Language**: TypeScript 5.x (`strict: true`, no implicit `any`)
- **Web Framework**: Next.js (App Router, React Server Components where appropriate)
- **UI Library**: React 19 / Tailwind CSS (or modern component styling)
- **Canvas / Drawing Engine**: Konva.js (`react-konva`) or optimized HTML5 2D Canvas API
- **Database**: PostgreSQL (managed via Supabase or standard PostgreSQL)
- **Object Storage**: S3-compatible Object Storage / Supabase Storage (accessed via modular storage provider abstraction)
- **Schema Validation**: Zod for client and server runtime validation
- **Testing**: Vitest / Playwright / React Testing Library
- **Runtime Constraints**: Node.js LTS or Next.js Edge runtime; avoid Python unless an explicit, approved technical need arises.

## Security & Data Handling Standards

1. **Payload Sanitization**: All user inputs, drawing titles, and metadata must be sanitized against XSS and injection attacks.
2. **CORS & Access Controls**: Storage buckets must enforce appropriate public-read for finalized artwork and restricted-write policies verified via server endpoints.
3. **Graceful Error Handling**: Client drawing state must not be cleared or lost if a network submission fails; retry mechanisms and offline error prompts must preserve user artwork.
4. **Data Minimization**: Collect only necessary drawing and session metadata; support anonymous or pseudonymous guest submissions in MVP while preparing for authenticated users in future phases.

## Governance

- This Constitution serves as the single source of architectural and engineering truth for the Throat Goat project.
- Any pull request or feature implementation that violates these principles MUST be rejected or amended with documented justification in the Implementation Plan's Complexity Tracking section.
- **Amendment Procedure**:
  1. Proposed changes to principles, tech stack, or governance must be documented in a dedicated RFC or PR.
  2. Amendments require approval from project maintainers.
  3. Semantic versioning rules apply to Constitution updates:
     - **MAJOR (X.0.0)**: Removal, fundamental alteration, or backward-incompatible redefinition of core principles.
     - **MINOR (1.X.0)**: Addition of new principles, tech stack expansions, or structural workflow changes.
     - **PATCH (1.0.X)**: Minor wording adjustments, typo fixes, or non-semantic clarifications.

**Version**: 1.0.0 | **Ratified**: 2026-08-23 | **Last Amended**: 2026-08-23

