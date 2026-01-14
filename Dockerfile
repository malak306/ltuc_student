# Use a lightweight Nginx image to serve static content
FROM nginx:alpine

# Copy the static website files to the Nginx html directory
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Expose port 80 for the web server
EXPOSE 80

# The default command starts Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
