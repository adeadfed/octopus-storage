output "octopus_admin_ssh_key" {
  value     = tls_private_key.ssh_key.private_key_openssh
  sensitive = true
}

output "octopus_admin_web_url" {
  value = "http://${aws_instance.octopus_admin_web_app_ec2.public_dns}"
}

# output "octopus_storage_frontend_bucket" {
#   value = aws_s3_bucket.octopus_storage_frontend_bucket.bucket
# }

output "octopus_storage_web_url" {
  value = "https://${aws_cloudfront_distribution.octopus_storage_cloudfront.domain_name}"
}

# output "octopus_user_pool_id" {
#   value = aws_cognito_user_pool.octopus_user_pool.id
# }

# output "octopus_storage_client_id" {
#   value = aws_cognito_user_pool_client.octopus_storage_client.id
# }

# output "octopus_admin_client_id" {
#   value = aws_cognito_user_pool_client.octopus_admin_client.id
# }

# output "octopus_admin_client_secret" {
#   value     = aws_cognito_user_pool_client.octopus_admin_client.client_secret
#   sensitive = true
# }