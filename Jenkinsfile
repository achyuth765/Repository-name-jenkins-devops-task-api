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

        stage('Deploy') {
            steps {
                echo 'Deploying application to staging environment'

                sh '''
                    IMAGE_TAG=${BUILD_NUMBER} \
                    docker compose \
                      -p task-api-staging \
                      -f deploy/docker-compose.staging.yml \
                      up -d --force-recreate

                    echo "Waiting for staging application..."

                    for i in $(seq 1 15); do
                        if curl -fsS http://localhost:3001/health; then
                            echo ""
                            echo "Staging deployment is healthy!"
                            exit 0
                        fi
                        sleep 2
                    done

                    echo "Staging health check failed."
                    docker logs task-api-staging
                    exit 1
                '''
            }
        }

        stage('Release') {
            steps {
                echo 'Releasing application to production'

                sh '''
                    docker tag task-api:${BUILD_NUMBER} task-api:release-${BUILD_NUMBER}

                    IMAGE_TAG=release-${BUILD_NUMBER} \
                    docker compose \
                      -p task-api-prod \
                      -f deploy/docker-compose.prod.yml \
                      up -d --force-recreate

                    echo "Waiting for production application..."

                    for i in $(seq 1 15); do
                        if curl -fsS http://localhost:3000/health; then
                            echo ""
                            echo "Production release is healthy!"
                            exit 0
                        fi
                        sleep 2
                    done

                    echo "Production health check failed."
                    docker logs task-api-prod
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo 'Build, Test, Code Quality, Security, Deploy and Release completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}
