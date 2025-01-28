pipeline {
  agent any

    stages {
      stage('Copy ENV File') {
        steps {
          sh 'echo "env file: {$ENV_FILE}" > .env'
            sh 'cp .env django/./'
            sh 'cat django/.env'
        }
      }
      stage('Docker-compose up'){
        steps {
          sh 'echo "test compose"'
            sh 'docker pull hello-world'
        }
      }
    }
}

