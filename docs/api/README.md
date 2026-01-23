# Targeting Workbench API Documentation

## Overview

This directory contains API documentation for the Targeting Workbench REST API.

## Files

- **`openapi.yaml`** - OpenAPI 3.0.3 specification for all targeting endpoints
- **`README.md`** - This file

## API Base URL

- **Development**: `http://localhost:3000/api/targeting`
- **Production**: `https://api.example.com/api/targeting`

## Authentication

All endpoints require:
1. **JWT Bearer Token** - Passed in `Authorization: Bearer <token>` header
2. **CSRF Token** - Passed in `X-CSRF-Token` header

## Quick Start

### View API Documentation

1. **Using Swagger UI**:
   - Install Swagger UI: `npm install -g swagger-ui-serve`
   - Run: `swagger-ui-serve openapi.yaml`
   - Open: `http://localhost:3000`

2. **Using Redoc**:
   - Install Redoc: `npm install -g redoc-cli`
   - Run: `redoc-cli serve openapi.yaml`
   - Open: `http://localhost:8080`

3. **Using Postman**:
   - Import `openapi.yaml` into Postman
   - Postman will generate a collection from the spec

### Example Request

```bash
# Get decision gates
curl -X GET "http://localhost:3000/api/targeting/decision-gates" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "X-CSRF-Token: <your-csrf-token>"

# List targets
curl -X GET "http://localhost:3000/api/targeting/targets?status=Nominated&limit=10" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "X-CSRF-Token: <your-csrf-token>"

# Create target
curl -X POST "http://localhost:3000/api/targeting/targets" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "X-CSRF-Token: <your-csrf-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Target Alpha",
    "target_type": "HPT",
    "priority": "HIGH",
    "target_status": "Nominated",
    "coordinates": "35.0,40.0"
  }'
```

## API Endpoints

### Decision Gates
- `GET /decision-gates` - Get all decision gates status

### Targets
- `GET /targets` - List targets (with filtering)
- `POST /targets` - Create target
- `GET /targets/{id}` - Get target by ID
- `PUT /targets/{id}` - Update target
- `DELETE /targets/{id}` - Delete target
- `PUT /targets/{id}/advance-stage` - Advance F3EAD stage
- `GET /summary` - Get targeting summary statistics

### DTL (Dynamic Target List)
- `GET /dtl` - List DTL entries
- `POST /dtl` - Create DTL entry
- `PUT /dtl/{id}/priority` - Update priority scores
- `GET /dtl/tst` - Get active Time-Sensitive Targets

### Mission Command
- `GET /mission/intent` - Get mission intent
- `PUT /mission/intent` - Update mission intent
- `GET /mission/guidance` - Get targeting guidance
- `GET /mission/authority` - Get decision authority matrix
- `GET /mission/tempo` - Get operational tempo

## Response Formats

All responses are JSON. Error responses follow this format:

```json
{
  "error": "Error message"
}
```

Success responses return the requested data directly (array or object).

## Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (for DELETE)
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Classification

All endpoints respect classification levels:
- `UNCLASS` - Unclassified
- `CUI` - Controlled Unclassified Information
- `SECRET` - Secret
- `TOP_SECRET` - Top Secret
- `TS_SCI` - Top Secret / Sensitive Compartmented Information

Users can only access data at or below their clearance level.

## Rate Limiting

API endpoints are rate-limited. Check response headers:
- `X-RateLimit-Limit` - Maximum requests per window
- `X-RateLimit-Remaining` - Remaining requests in current window
- `X-RateLimit-Reset` - Time when limit resets

## Versioning

Current API version: `0.1.1`

API versioning strategy: TBD (may use URL versioning `/api/v1/targeting` or header versioning)

## Support

For API issues or questions, contact the Targeting Workbench Team.

---

**Last Updated**: 2026-01-22  
**Classification**: UNCLASSIFIED
