# Step 1: Use a lightweight Node.js image as the base
FROM node:alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to the container
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code to the container
COPY . .

# Step 6: Copy the .env file into the container
COPY .env .env

# Step 7: Expose the port that the app will run on
EXPOSE 3000

# Step 8: Define the command to run the application
CMD ["node", "app.js"]
