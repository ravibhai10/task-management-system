Backend server (minimal demo)

Run from the `server/` folder:

1. cd server
2. npm install
3. npm start

This starts a development Express server on port 4000 with simple file-based persistence (server/data).

Endpoints:
- GET /api/health
- POST /api/auth/signup { email, password }
- POST /api/auth/login { email, password }
- GET /api/tasks
- POST /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

Note: This is a minimal demo backend intended for local development only. Do not use in production without adding proper authentication, validation, and password hashing.
