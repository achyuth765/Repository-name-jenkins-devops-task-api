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

                echo 'Waiting for SonarQube Quality Gate result'

                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
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
                    docker rm -f task-api-staging || true

                    IMAGE_TAG=${BUILD_NUMBER} \
                    docker compose \
                      -p task-api-staging \
                      -f deploy/docker-compose.staging.yml \
                      up -d --force-recreate

                    for i in $(seq 1 15); do
                        if curl -fsS http://localhost:3001/health; then
                            echo ""
                            echo "Staging deployment is healthy!"
                            exit 0
                        fi

                        sleep 2
                    done

                    docker logs task-api-staging
                    exit 1
                '''
            }
        }

        stage('Release') {
            steps {
                echo 'Releasing application to production'

                sh '''
                    docker rm -f task-api-prod || true

                    docker tag \
                      task-api:${BUILD_NUMBER} \
                      task-api:release-${BUILD_NUMBER}

                    IMAGE_TAG=release-${BUILD_NUMBER} \
                    docker compose \
                      -p task-api-prod \
                      -f deploy/docker-compose.prod.yml \
                      up -d --force-recreate

                    for i in $(seq 1 15); do
                        if curl -fsS http://localhost:3000/health; then
                            echo ""
                            echo "Production release is healthy!"
                            exit 0
                        fi

                        sleep 2
                    done

                    docker logs task-api-prod
                    exit 1
                '''
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Verifying Prometheus monitoring'

                sh '''
                    mkdir -p reports

                    curl -fsS \
                      http://localhost:3000/metrics \
                      > reports/prometheus-metrics.txt

                    grep -q \
                      "task_api_http_requests_total" \
                      reports/prometheus-metrics.txt

                    curl -fsS http://localhost:9090/-/ready

                    curl -fsS \
                      http://localhost:9090/api/v1/targets \
                      | node -e "
                        let data = '';

                        process.stdin.on(
                          'data',
                          chunk => data += chunk
                        );

                        process.stdin.on(
                          'end',
                          () => {
                            const json = JSON.parse(data);

                            const target =
                              json.data.activeTargets.find(
                                t =>
                                  t.labels.job ===
                                  'task-api-production'
                              );

                            if (
                              !target ||
                              target.health !== 'up'
                            ) {
                              console.error(
                                'Prometheus target is DOWN'
                              );
                              process.exit(1);
                            }

                            console.log(
                              'Prometheus target is UP'
                            );
                          }
                        );
                      "

                    echo "Monitoring verification successful!"
                '''
            }

            post {
                always {
                    archiveArtifacts(
                        artifacts: 'reports/prometheus-metrics.txt',
                        allowEmptyArchive: true
                    )
                }
            }
        }
    }

    post {
        success {
            echo 'ALL 7 DEVOPS PIPELINE STAGES COMPLETED SUCCESSFULLY!'
        }

        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}
