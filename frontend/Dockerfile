# Use official Node.js image
FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install

# RUN npm run build

# Start the app
CMD ["npm", "run", "dev"]
