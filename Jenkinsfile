pipeline {
    agent any
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

        stage('Code Quality') {
            steps {
                echo 'Running SonarQube code quality analysis'

                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Build, Test and Code Quality completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}
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
