# StatusSphere Platform

**Cloud-Native Application Health & Reliability Platform**

StatusSphere monitors application health, uptime, latency, and incidents through a FastAPI backend and React dashboard.

The project also demonstrates an end-to-end Cloud & DevOps workflow covering CI, container security, AWS infrastructure, configuration management, and Kubernetes deployment.

---

## 🚀 Key Features

* **Scheduled asynchronous application health checks**
* **Uptime and latency tracking**
* **Incident detection and management**
* **FastAPI REST APIs**
* **React + TypeScript monitoring dashboard**
* **PostgreSQL persistence**
* **Dockerized frontend and backend**
* **Kubernetes-based cloud deployment**
* **Infrastructure provisioned with Terraform**
* **EC2 configuration and k3s setup with Ansible**
* **Helm-based Kubernetes deployments**

---

## 🏗️ Architecture

```
                         ┌──────────────┐
                         │    Browser   │
                         └──────┬───────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Nginx / React   │
                       │    Frontend     │
                       └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ FastAPI Backend │
                       │ Health Checks   │
                       │ REST API        │
                       └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ PostgreSQL / RDS│
                       └─────────────────┘

                         AWS EC2
                    ┌──────────────────┐
                    │       k3s        │
                    │    Kubernetes    │
                    │                  │
                    │ Backend + Frontend│
                    └──────────────────┘
```

Terraform provisions the AWS infrastructure, Ansible configures the EC2 host and k3s cluster, and Helm manages the Kubernetes application deployment.

---

## 🔄 DevOps Pipeline

```
Git Push
   │
   ▼
GitHub Actions
   │
   ├── Backend Tests
   ├── Frontend Lint / Build
   │
   ▼
Docker Build
   │
   ▼
Trivy Security Scan
   │
   ▼
GitHub Container Registry
   │
   ▼
Terraform
   │
   ▼
AWS EC2 + RDS
   │
   ▼
Ansible
   │
   ▼
k3s Kubernetes
   │
   ▼
Helm
   │
   ▼
StatusSphere
```

### Pipeline Responsibilities

| Stage | Technology | Purpose |
| :--- | :--- | :--- |
| **CI** | GitHub Actions | Test and validate changes |
| **Containerization** | Docker | Package applications consistently |
| **Security** | Trivy | Scan images for vulnerabilities |
| **Registry** | GHCR | Store versioned container images |
| **Infrastructure** | Terraform | Provision AWS infrastructure |
| **Configuration** | Ansible | Configure EC2 and install k3s |
| **Orchestration** | Kubernetes / k3s | Run application workloads |
| **Packaging** | Helm | Manage Kubernetes deployments |

---

## 🛠️ Technology Stack

### Application
* **Backend:** Python, FastAPI, SQLAlchemy, Alembic
* **Database:** PostgreSQL
* **Frontend:** React, TypeScript, Nginx

### Cloud & DevOps
* **Cloud Infrastructure:** AWS EC2, AWS RDS
* **IaC & Configuration:** Terraform, Ansible
* **Container & Orchestration:** Docker, Docker Compose, Kubernetes / k3s, Helm
* **CI/CD & Security:** GitHub Actions, Trivy, GitHub Container Registry (GHCR)

### Observability
* Prometheus metrics endpoint
* Prometheus
* Grafana
* Loki
* Alertmanager

> *Note: The full Prometheus/Grafana/Loki/Alertmanager stack is currently in progress.*

---

## ☁️ AWS Infrastructure

Terraform provisions:
* EC2 instance
* RDS PostgreSQL
* Security groups
* Elastic IP
* IAM configuration
* S3-based remote Terraform state
* DynamoDB state locking

RDS is configured as a private database and is accessible only from the application infrastructure.

Ansible configures the EC2 host and bootstraps a lightweight k3s Kubernetes cluster.

---

## ☸️ Kubernetes & Helm

StatusSphere runs in a dedicated Kubernetes namespace with:
* Backend Deployment
* Frontend Deployment
* Kubernetes Services
* Readiness probes
* Liveness probes
* Resource requests and limits
* External database credentials Secret

The Helm chart manages application configuration including:
* Container image repositories and tags
* Replica counts
* Resource limits
* Kubernetes Services
* Deployment configuration

*Helm install, upgrade, and rollback workflows have been verified against the cluster.*

---

## 🔐 Security & Reliability

The project implements several production-style practices:
* Trivy vulnerability scanning before image publication
* Least-privilege AWS IAM access
* Private RDS database
* Restricted SSH access
* Secrets excluded from source control
* Terraform remote state
* Kubernetes readiness and liveness probes
* Rolling application updates
* Container health checks

---

## 💻 Local Development

### Prerequisites
* Docker
* Docker Compose

### Start the complete local stack:
```bash
docker compose up --build
```

This starts:
* PostgreSQL
* FastAPI backend
* React frontend

### Health Check
```bash
curl http://localhost:8000/health
```

### Metrics
```bash
curl http://localhost:8000/metrics
```

---

## 📁 Project Structure

```
status-sphere-platform/
├── backend/              # FastAPI application
├── frontend/             # React + TypeScript application
├── infra/                # Terraform AWS infrastructure
│   └── bootstrap/        # Remote-state backend
├── ansible/              # EC2 / k3s configuration
├── k8s/                  # Kubernetes manifests
├── helm/                 # Helm chart
├── .github/workflows/    # CI/CD workflows
└── docker-compose.yml    # Local development
```

---

## 📊 Project Status

### ✅ Completed
* FastAPI monitoring backend
* React monitoring dashboard
* PostgreSQL persistence
* Docker containerization
* Docker Compose setup
* GitHub Actions CI
* Trivy vulnerability scanning
* GHCR image publishing
* Terraform AWS infrastructure
* Ansible-based k3s configuration
* Kubernetes deployment
* Helm install, upgrade, and rollback

### 🔄 In Progress
* Prometheus/Grafana/Alertmanager observability stack

### 📋 Planned
* Loki log aggregation
* Production alerting rules
* Grafana dashboards
* Fully automated image-to-Kubernetes deployment

---

## 🎯 Why StatusSphere?

StatusSphere was built to demonstrate the complete lifecycle of a cloud-native application:

```
Develop ──> Test ──> Secure ──> Containerize ──> Provision ──> Configure ──> Deploy ──> Monitor
```

The goal is not simply to demonstrate individual DevOps tools, but to show how they work together to create a repeatable, secure, and reliable application delivery workflow.

---

## Author

**Shreeya Sahai**
