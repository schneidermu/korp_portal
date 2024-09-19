pipeline {
    agent any

    stages {
        stage('Copy ENV File') {
            steps {
            	sh 'echo "env file: {$ENV_FILE}" > .env'
		sh 'cp .env backend/./'
            }
        }
	stage('Docker-compsoe up'){
	    steps {
	    	sh 'docker pull hello-world'
		sh 'docker run hello-world'
	    }
	}
    }
}

