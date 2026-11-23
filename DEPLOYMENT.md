# Deployment

## Docker Compose

1. Copy `.env.example` to `.env`.
2. Set `JWT_SECRET` and `MONGO_ROOT_PASSWORD` to different random values. Generate each locally with:

   ```sh
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

   The MongoDB password should use URL-safe hexadecimal characters.
3. Set `FRONTEND_URL`, `REACT_APP_BACKEND_URL`, and `REACT_APP_SOCKET_URL` to the public HTTPS origins/URLs for your deployment. Set the Cloudinary and Chapa values required by the features you enable.
4. Validate and start the services:

   ```sh
   docker compose config
   docker compose up --build -d
   ```

   The frontend image embeds API and socket URLs at build time; rebuild it after changing either URL. The frontend is served on port 3000, the API on 5000, and the socket server on 4000. Put a TLS reverse proxy in front of these services for public production traffic.

MongoDB has authentication enabled and is not published to the host. Existing MongoDB volumes retain their initialized credentials; changing the Compose password does not rotate credentials in an existing volume.

## Managed hosting

Set environment variables in the hosting provider rather than committing `.env` files. The backend requires a strong `JWT_SECRET`, `MONGODB_URI`, and an exact comma-separated `FRONTEND_URL` allowlist. The frontend's `REACT_APP_BACKEND_URL` and `REACT_APP_SOCKET_URL` must be set during its build and use the public HTTPS URLs. The socket service's `CLIENT_URL` must match the frontend origin.

The backend does not start in production without a JWT secret, allowed frontend origin, and reachable MongoDB. Its `/health` endpoint reports unavailable until MongoDB is connected.

## First administrator

Public registration creates ordinary users only. Create the initial administrator account through the normal signup flow, then grant that account the `superadmin` role through a trusted, one-time database operation. Afterward, superadmins can grant or revoke `admin` roles from the admin users page. Never expose a role-promotion operation to public signup.
