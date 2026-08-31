output "instance_public_ip" {
  description = "Elastic IP address of the StatusSphere host"
  value       = aws_eip.statussphere.public_ip
}

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.statussphere.id
}

output "db_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.statussphere.endpoint
}

output "db_password" {
  description = "Generated RDS password"
  value       = random_password.db_password.result
  sensitive   = true
}

output "security_group_id" {
  description = "Security group ID - needed by deploy.yml to temporarily authorize the GitHub Actions runner's IP for SSH during deploys"
  value       = aws_security_group.statussphere.id
}