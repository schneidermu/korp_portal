pipeline {
    agent any

    stages {
        stage('Copy ENV File') {
            steps {
            	sh 'echo "env file: {$ENV_FILE}" > .env'
		sh 'cp .env backend/./'
		sh 'cat backend/.env'
            }
        }
	stage('Docker-compsoe up'){
	    steps {
			sh 'echo "test compose"'
			sh 'docker pull hello-world'
	    }
	}
    }
}

