# Frontend

## Build and package a WAR

```sh
# Build the image:
docker build -t kp-frontend-war --target war .

# Build a WAR:
docker run --rm -it -v ./:/app kp-frontend-war

# Deploy to Liferay:
cp pkg/*.war "/path/to/liferay/volumes/deploy"
```
