# StatusSphere Platform

**Cloud-Native Application Health & Reliability Platform**

StatusSphere monitors application health, uptime, latency, and incidents through a FastAPI backend and React dashboard.

The project demonstrates an end-to-end Cloud & DevOps workflow covering CI/CD, container security, AWS infrastructure, Kubernetes, observability, and automated deployment.

🌐 **Live Demo:** [http://54.156.160.127/](http://54.156.160.127/)

> The demo currently runs over HTTP, so browsers may display a "Not Secure" warning.

---

## 🚀 Key Features

* **Scheduled asynchronous application health checks**
* **Uptime and latency tracking**
* **Incident detection and management**
* **Shareable workspace dashboards**
* **FastAPI REST APIs**
* **React + TypeScript monitoring dashboard**
* **PostgreSQL persistence**
* **Dockerized frontend and backend**
* **Kubernetes-based cloud deployment**
* **Infrastructure provisioned with Terraform**
* **EC2 and k3s configuration with Ansible**
* **Helm-based Kubernetes deployments**
* **Prometheus metrics and Grafana dashboards**
* **Loki log aggregation**
* **Automated image deployment with GitHub Actions**
* **Trivy container vulnerability scanning**

---

## 🌐 Try the Live Demo

Open: **[http://54.156.160.127/](http://54.156.160.127/)**

Click **Create your dashboard** to create a unique workspace.

Each workspace has a shareable URL: `/w/<workspace-id>`

You can create an application inside your workspace and StatusSphere will periodically monitor it.

---

## 🏗️ Architecture

```text
                        ┌──────────────┐
                        │   Browser    │
                        └──────┬───────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │ Traefik / Nginx │
                       │ React Frontend  │
                       └────────┬────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │ FastAPI Backend │
                       │ REST API        │
                       │ Health Checks   │
                       │ Metrics         │
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
                       │ Backend + Frontend│
                       └──────────────────┘
```

Terraform provisions the AWS infrastructure, Ansible configures the EC2 host and k3s cluster, and Helm manages the Kubernetes application deployment.

---

## 🔄 DevOps Pipeline

```text
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
Automated Deployment
   │
   ▼
Kubernetes / k3s
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
| **Deployment** | GitHub Actions | Roll out new images automatically |

---

## 🛠️ Technology Stack

### Application
* **Backend:** Python, FastAPI, SQLAlchemy, Alembic
* **Database:** PostgreSQL
* **Frontend:** React, TypeScript, Nginx

### Cloud & DevOps
* **Cloud:** AWS EC2, AWS RDS
* **IaC:** Terraform
* **Configuration:** Ansible
* **Containers:** Docker, Docker Compose
* **Orchestration:** Kubernetes / k3s
* **Packaging:** Helm
* **CI/CD:** GitHub Actions
* **Security:** Trivy
* **Registry:** GitHub Container Registry

### Observability
* Prometheus
* Grafana
* Loki
* Custom application metrics

> *Alertmanager and permanent log-shipping agents are intentionally out of scope due to resource constraints on the single-node environment.*

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

*RDS is private and accessible only from the application infrastructure.*
*Ansible configures the EC2 host and bootstraps the k3s Kubernetes cluster.*

---

## ☸️ Kubernetes & Helm

StatusSphere runs in a dedicated Kubernetes namespace with:
* Backend Deployment
* Frontend Deployment
* Kubernetes Services
* Readiness and liveness probes
* Resource requests and limits
* External database credentials Secret
* Traefik Ingress

Helm manages:
* Container image repositories and tags
* Replica counts
* Resource limits
* Kubernetes Services
* Deployment configuration

*Helm install, upgrade, and rollback workflows have been verified against the cluster.*

---

## 🔐 Security & Reliability

The project implements:
* Trivy vulnerability scanning before image publication
* Least-privilege AWS IAM access
* Private RDS database
* Restricted SSH access
* Secrets excluded from source control
* Terraform remote state
* Kubernetes readiness and liveness probes
* Rolling application updates
* Container health checks
* Automated deployment rollback on failure

---

## 💻 Local Development

### Prerequisites
* Docker
* Docker Compose

### Start the complete local stack
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

```text
status-sphere-platform/
├── backend/               # FastAPI application
├── frontend/              # React + TypeScript application
├── infra/                 # Terraform AWS infrastructure
│   └── bootstrap/         # Remote-state backend
├── ansible/               # EC2 / k3s configuration
├── k8s/                   # Kubernetes manifests
├── helm/                  # Helm chart
├── .github/workflows/     # CI/CD workflows
└── docker-compose.yml     # Local development
```

---

## 📊 Project Status

### ✅ Completed
* FastAPI monitoring backend
* React monitoring dashboard
* Shareable workspace system
* PostgreSQL persistence
* Docker containerization
* GitHub Actions CI/CD
* Trivy vulnerability scanning
* GHCR image publishing
* Terraform AWS infrastructure
* Ansible-based k3s configuration
* Kubernetes deployment
* Helm install, upgrade, and rollback
* Prometheus metrics
* Grafana dashboards
* Loki log aggregation
* Automated Kubernetes deployments
* Public AWS deployment

### 📋 Deliberately Out of Scope
* Alertmanager
* Permanent log-shipping agent
* HTTPS/TLS without a custom domain

---

## 🎯 Why StatusSphere?

StatusSphere demonstrates the complete lifecycle of a cloud-native application:

```text
Develop ──> Test ──> Secure ──> Containerize ──> Provision ──> Configure ──> Deploy ──> Monitor
```

The goal is to demonstrate how these technologies work together to build a repeatable, secure, observable, and reliable application delivery workflow.

---

## 👤 Author

**Shreeya Sahai**
