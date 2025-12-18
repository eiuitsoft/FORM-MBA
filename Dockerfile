FROM node:latest as build-stage

FROM nginx:alpine
# Copy ui
COPY ./dist/ /usr/share/nginx/html

# Copy Nginx configuration for the application
COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /home/cert

#COPY ./cert /home/cert

# Launch NGINX
CMD [ "nginx", "-g", "daemon off;" ]