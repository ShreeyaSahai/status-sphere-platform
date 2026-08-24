resource "aws_security_group" "statussphere" {
  name        = "${var.project_name}-sg"
  description = "Security group for StatusSphere EC2 host (k3s)"

  ingress {
    description = "SSH from admin IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["115.245.68.162/32"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "k3s API server"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["115.245.68.162/32"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-sg"
    Project = "StatusSphere"
  }
}

# Pinned to Ubuntu 24.04 LTS (Noble Numbat), us-east-1, amd64, hvm:ebs-ssd-gp3
# Source: https://cloud-images.ubuntu.com/locator/ec2/ (confirmed 2026-08-23)
# The data "aws_ami" dynamic lookup returned no results for this account/region combo;
# revisit that approach later if useful, but pinning unblocks provisioning now.
locals {
  ubuntu_ami_id = "ami-052355af2a014bd2c"
}

resource "aws_key_pair" "statussphere" {
  key_name   = "${var.project_name}-key"
  public_key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBh8BTqIV+1TuzaCP2niA9w/DRcbna7LlZDy2dhX/JL0 statussphere-ec2"
}

resource "aws_instance" "statussphere" {
  ami                    = local.ubuntu_ami_id
  instance_type          = "t3.small"
  key_name               = aws_key_pair.statussphere.key_name
  vpc_security_group_ids = [aws_security_group.statussphere.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name    = "${var.project_name}-host"
    Project = "StatusSphere"
  }
}

resource "aws_eip" "statussphere" {
  instance = aws_instance.statussphere.id
  domain   = "vpc"

  tags = {
    Name    = "${var.project_name}-eip"
    Project = "StatusSphere"
  }
}

# --- RDS PostgreSQL ---

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_db_subnet_group" "statussphere" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name    = "${var.project_name}-db-subnet-group"
    Project = "StatusSphere"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Allow Postgres access only from the StatusSphere EC2 host"

  ingress {
    description     = "Postgres from EC2 host"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.statussphere.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-rds-sg"
    Project = "StatusSphere"
  }
}

resource "random_password" "db_password" {
  length  = 24
  special = false
}

resource "aws_db_instance" "statussphere" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "16.4"
  instance_class = "db.t3.micro"

  allocated_storage = 20
  storage_type      = "gp3"

  db_name  = "statussphere"
  username = "statussphere_admin"
  password = random_password.db_password.result

  db_subnet_group_name   = aws_db_subnet_group.statussphere.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az                = false
  publicly_accessible     = false
  skip_final_snapshot     = true
  backup_retention_period = 1

  tags = {
    Name    = "${var.project_name}-db"
    Project = "StatusSphere"
  }
}