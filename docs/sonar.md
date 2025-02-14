# Sonar Qube code scan

## Scan locally

### Run the server

```sh
docker run -d \
  --name sonarqube \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  -p 9000:9000 \
  sonarqube

# Wait for the "SonarQube is operational" line:
docker logs -f sonarqube
```

- Open the Web UI at `http://sonar.localhost:9000` and login with `admin/admin`.
- Change the password as prompted.
- Click "create a local project", name the project and choose the target branch.
- Pick "use global settings".
- Choose "analysis methos: locally".
- Set project key to `kp`.
- Generate a token.

### Run the analysis

```sh
cd korp_portal

url=http://sonar.localhost:9000
project_key=kp
token= # set the token
python_version=3.9 # optional, really

docker run --rm \
  -v "./:/usr/src" \
  --network host \
  sonarsource/sonar-scanner-cli \
    -Dsonar.sources=. \
    -Dsonar.exclusions='kp-dev/dummy/**/*' \
    -Dsonar.host.url=$url \
    -Dsonar.projectKey=$project_key \
    -Dsonar.token=$token \
    -Dsonar.python.version=$python_version
```

Wait for the analysis to complete and browse it in the Web UI.

## Docs

- [Try out SonarQube Community Build](https://docs.sonarsource.com/sonarqube-community-build/try-out-sonarqube/)
- [Running SonarScanner CLI from the Docker image](https://docs.sonarsource.com/sonarqube-community-build/analyzing-source-code/scanners/sonarscanner/#sonarscanner-from-docker-image)
- [Docker Hub: `sonarqube`](https://hub.docker.com/_/sonarqube/)
- [Docker Hub: `sonarsource/sonar-scanner-cli`](https://hub.docker.com/r/sonarsource/sonar-scanner-cli)

## Versions

The guide is tested for `sonarqube:25.2.0.102705-community` and `sonarsource/sonar-scanner-cli:11.2`
