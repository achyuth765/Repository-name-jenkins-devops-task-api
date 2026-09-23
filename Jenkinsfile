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
            
