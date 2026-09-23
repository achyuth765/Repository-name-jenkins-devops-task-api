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
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Security') {
            steps {
                echo 'Running Trivy security scan'

                sh '''
                    mkdir -p reports

                    trivy image \
                      --severity HIGH,CRITICAL \
                      --format table \
                      --output reports/trivy-report.txt \
                      task-api:${BUILD_NUMBER}

                    trivy image \
                      --severity CRITICAL \
                      --ignore-unfixed \
                      --exit-code 1 \
                      task-api:${BUILD_NUMBER}
                '''
            }

            post {
                always {
                    archiveArtifacts(
                        artifacts: 'reports/trivy-report.txt',
                        allowEmptyArchive: true
                    )
                }
            }
        }
    }

    post {
        success {
            echo 'Build, Test, Code Quality and Security completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}
