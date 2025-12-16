# Contracts

This folder holds contract-first definitions for backend services (Azure proxies) that SPFx will call.

Goals:

- Make the SPFx ↔ proxy boundary explicit
- Avoid embedding any secrets in client code
- Enable parallel work with the backend vendor using agreed request/response schemas
