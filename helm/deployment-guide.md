# NovaSignal Deployment Guide

## Overview

This guide covers the deployment of NovaSignal using the automated CI/CD pipeline and Kubernetes with Helm charts.

## Prerequisites

- Kubernetes cluster (1.24+)
- Helm 3.8+
- kubectl configured for your cluster
- Docker registry access
- GitHub repository access

## Quick Start

### 1. Build and Push Images

```bash
# Build frontend image
docker build -t your-registry.com/novasignal-frontend:latest -f frontend/Dockerfile frontend/

# Build backend image
docker build -t your-registry.com/novasignal-backend:latest -f backend/Dockerfile backend/

# Push images
docker push your-registry.com/novasignal-frontend:latest
docker push your-registry.com/novasignal-backend:latest
```

### 2. Install with Helm

```bash
# Add necessary Helm repositories
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Install NovaSignal
helm install novasignal ./helm/novasignal \
  --namespace novasignal \
  --create-namespace \
  --set frontend.image.registry="your-registry.com" \
  --set backend.image.registry="your-registry.com" \
  --set ingress.hostname="novasignal.yourdomain.com"
```

## Configuration

### Required Values

```yaml
# Environment
environment: production

# Images
frontend:
  image:
    registry: "your-registry.com"
    repository: "novasignal-frontend"
    tag: "latest"

backend:
  image:
    registry: "your-registry.com" 
    repository: "novasignal-backend"
    tag: "latest"

# Ingress
ingress:
  enabled: true
  hostname: "novasignal.yourdomain.com"

# Secrets (use external secret management in production)
secrets:
  databaseUrl: "postgresql://user:pass@host:5432/dbname"
  jwtSecret: "your-jwt-secret"
  encryptionKey: "your-encryption-key"
```

### Production Values Example

```yaml
# values-production.yaml
environment: production

frontend:
  replicaCount: 3
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi

backend:
  replicaCount: 3
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 15
    targetCPUUtilizationPercentage: 70
  resources:
    requests:
      cpu: 200m
      memory: 256Mi
    limits:
      cpu: 1000m
      memory: 1Gi

ingress:
  enabled: true
  hostname: "novasignal.yourdomain.com"
  tls:
    enabled: true
    secretName: "novasignal-tls"

networkPolicy:
  enabled: true

persistence:
  enabled: true
  size: 10Gi
  storageClass: "fast-ssd"

postgresql:
  enabled: true
  auth:
    database: "novasignal"
    username: "novasignal"
  primary:
    persistence:
      enabled: true
      size: 20Gi

redis:
  enabled: true
  architecture: standalone
```

## CI/CD Pipeline

### GitHub Actions

The pipeline is automatically triggered on:
- Push to `main` branch (production deployment)
- Push to `develop` branch (staging deployment)
- Pull requests (testing only)

### Pipeline Stages

1. **Test & Build**
   - Unit tests
   - Integration tests
   - Security scanning
   - Docker image builds

2. **Security & Quality**
   - SAST scanning with CodeQL
   - Dependency vulnerability scanning with Snyk
   - Code quality checks

3. **Deploy to Staging**
   - Automatic deployment to staging environment
   - Smoke tests
   - Performance tests

4. **Deploy to Production**
   - Manual approval required
   - Blue-green deployment
   - Health checks
   - Rollback capability

### Environment Variables

Set these secrets in your GitHub repository:

```bash
# Container Registry
REGISTRY_USERNAME
REGISTRY_PASSWORD
REGISTRY_URL

# Kubernetes
KUBE_CONFIG_DATA  # Base64 encoded kubeconfig

# Staging Environment
STAGING_NAMESPACE
STAGING_HOSTNAME

# Production Environment  
PROD_NAMESPACE
PROD_HOSTNAME

# Database
DATABASE_URL

# Application Secrets
JWT_SECRET
ENCRYPTION_KEY
```

## Monitoring & Observability

### Health Checks

- Frontend: `GET /health`
- Backend: `GET /health`

### Metrics

Prometheus metrics are exposed at:
- Backend: `GET /metrics`

### Logging

Application logs are collected and can be viewed with:

```bash
# Frontend logs
kubectl logs -n novasignal -l app.kubernetes.io/component=frontend -f

# Backend logs
kubectl logs -n novasignal -l app.kubernetes.io/component=backend -f
```

## Security

### Network Policies

Network policies are enabled by default to:
- Restrict pod-to-pod communication
- Allow only necessary ingress traffic
- Control egress to external services

### Pod Security

- Non-root containers
- Read-only root filesystem where possible
- Security contexts applied
- Resource limits enforced

### TLS/SSL

- Automatic certificate management with cert-manager
- HTTPS redirect enforced
- Secure headers configured

## Troubleshooting

### Common Issues

1. **Images not pulling**
   ```bash
   kubectl describe pod <pod-name> -n novasignal
   # Check imagePullSecrets configuration
   ```

2. **Database connection issues**
   ```bash
   # Check database connectivity
   kubectl exec -it <backend-pod> -n novasignal -- nc -zv postgresql 5432
   ```

3. **Ingress not working**
   ```bash
   # Check ingress controller
   kubectl get ingress -n novasignal
   kubectl describe ingress novasignal -n novasignal
   ```

### Rollback

```bash
# List releases
helm list -n novasignal

# Rollback to previous version
helm rollback novasignal <revision> -n novasignal
```

## Scaling

### Manual Scaling

```bash
# Scale frontend
kubectl scale deployment novasignal-frontend --replicas=5 -n novasignal

# Scale backend
kubectl scale deployment novasignal-backend --replicas=8 -n novasignal
```

### Horizontal Pod Autoscaler

HPA is configured to automatically scale based on:
- CPU utilization (default: 70%)
- Memory utilization (optional)
- Custom metrics (optional)

## Backup & Recovery

### Database Backup

```bash
# Manual backup
kubectl exec -it <postgresql-pod> -n novasignal -- pg_dump -U novasignal novasignal > backup.sql
```

### Persistent Volume Backup

Follow your cloud provider's documentation for persistent volume snapshots.

## Updates & Maintenance

### Application Updates

1. Update image tags in values.yaml or CI/CD pipeline
2. Deploy using Helm upgrade:
   ```bash
   helm upgrade novasignal ./helm/novasignal -n novasignal -f values-production.yaml
   ```

### Helm Chart Updates

1. Test changes in staging
2. Update chart version in Chart.yaml
3. Deploy to production with approval

## Support

For issues and questions:
- Check application logs
- Review Kubernetes events: `kubectl get events -n novasignal`
- Monitor resource usage: `kubectl top pods -n novasignal`
- Review this documentation and Helm chart values