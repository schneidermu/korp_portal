# Liferay Portlet build guide

Generate metadata image:

```sh
docker build --build-arg NAME=$portlet_name -t $image_tag .
```

For a usage example see `react/Dockerfile` and the main README.
