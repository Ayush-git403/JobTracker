# Single image, used for both the API service and the worker service in ECS —
# the only difference between them is the startup command, set per-service at
# the ECS task definition level (not baked into this image).

FROM node:20-alpine

WORKDIR /app

# Copy only package files first so Docker can cache the npm install layer —
# this layer only invalidates when dependencies actually change, not on
# every code edit, which speeds up rebuilds significantly.
COPY package*.json ./
RUN npm ci --omit=dev

# Now copy the rest of the source
COPY . .

# Both the API (PORT env var, defaults 5000) and the worker run from this
# same image. Default CMD runs the API; the worker's ECS task definition
# overrides this with ["node", "worker/scoreWorker.js"].
EXPOSE 5000
CMD ["node", "index.js"]