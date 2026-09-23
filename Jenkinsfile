pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Installing dependencies and building Docker image'

                sh '''
                    npm ci
                    docker build -t task-api:${BUILD_NUMBER} .
                '''
            }
        }

        stage('Test') {
            steps {
                echo 'Running automated tests'

                sh '''
                    npm test
                '''
            }
        }
    }

    post {
        success {
            echo 'Build and Test completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}
