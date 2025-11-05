# CampusBot Project Roadmap

This document outlines the planned development phases for the CampusBot project.

## Milestone 1: Core API Foundation ✅

**Status**: Completed

### Completed Features:
- [x] Basic API structure with Express.js
- [x] CRUD operations for Users, Robots, Orders, and Restaurants
- [x] OpenAPI 3.0 specification
- [x] Swagger UI documentation
- [x] Comprehensive test suite (375+ tests)
- [x] Docker containerization
- [x] PostgreSQL database schema
- [x] CI/CD pipeline with GitHub Actions
- [x] Project documentation and governance

## Milestone 2: Student Mobile UI ✅

**Status**: Completed

### Completed Features:
- [x] Home page with restaurant browsing and search
- [x] Restaurant detail page with menu items
- [x] Shopping cart functionality
- [x] Checkout flow with order placement
- [x] Live order tracking with progress bar
- [x] My Orders page for order history
- [x] User authentication (registration/login)
- [x] JWT-based authentication
- [x] Role-based access control (RBAC)
- [x] Password hashing and validation
- [x] Session management
- [x] Responsive mobile-first UI with Tailwind CSS

## Milestone 3: Simulated Robot Telemetry & Fleet Dashboard ✅

**Status**: Completed

### Completed Features:
- [x] Telemetry generator script for 5 simulated robots
- [x] Fleet dashboard UI showing all robots with real-time updates
- [x] Simulated robot data: battery, position, speed, distance traveled
- [x] Server-Sent Events (SSE) for live telemetry streaming
- [x] Stop command functionality for fleet control
- [x] Connection status indicator
- [x] Visual status badges and icons for robot states
- [x] Comprehensive telemetry API endpoints
- [x] Telemetry test suite (378 total tests)
- [x] Enhanced dashboard UI with Header component

## Milestone 4: Vendor Kiosk + Order Handoff Flow ✅

**Status**: Completed

### Completed Features:
- [x] Vendor kiosk UI for order management
- [x] Order acceptance workflow
- [x] Order status transitions (CREATED → PREPARING → READY)
- [x] Robot assignment integration
- [x] Order handoff flow from student → vendor → robot
- [x] Vendor-specific dashboard for managing orders
- [x] API endpoint for vendors to fetch their orders (GET /api/orders/vendor-orders)
- [x] Authorization for vendor order status updates
- [x] Order filtering by status in vendor kiosk
- [x] Order details modal with full information
- [x] Real-time order updates with polling
- [x] Comprehensive test suite (40+ tests for vendor functionality)
- [x] End-to-end order lifecycle: CREATED → PREPARING → READY → ASSIGNED → EN_ROUTE → DELIVERED

## Future Considerations

- Machine learning for route optimization
- Integration with IoT devices
- Multi-campus support
- Advanced analytics dashboard
- Third-party integrations (payment systems, etc.)

## Funding

CampusBot is currently developed as part of an academic course (CSC510 Software Engineering) at NC State University. The project is open source and community-driven. There is no external funding at this time. Development is sustained through:

- Academic course requirements
- Open source community contributions
- Volunteer developer time

Future funding opportunities may include:
- University research grants
- Industry partnerships
- Open source foundation support

## Deprecation Policy

When components or APIs are deprecated, we will:

1. **Announce deprecation** at least 6 months before removal
2. **Update documentation** with migration guides
3. **Mark deprecated features** in code with `@deprecated` tags
4. **Provide alternative solutions** in the deprecation notice
5. **Maintain backward compatibility** during the deprecation period when possible

Deprecation notices will be published in:
- Release notes (CHANGES_SUMMARY.md)
- Project roadmap (this file)
- API documentation (OpenAPI spec)
- GitHub issues and releases

## Contributing

This roadmap is a living document. Feel free to suggest changes or additions by opening an issue or pull request.
