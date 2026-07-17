FROM node:20-slim

WORKDIR /app

# Copy package lock and files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]
