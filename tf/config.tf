# frontend app JS config
data "template_file" "frontend_js_config" {
  template = file("./config_templates/config.js.tmpl")
  vars = {
    region_id        = "us-east-1"
    identity_pool_id = aws_cognito_identity_pool.octopus_identity_pool.id

    user_pool_id        = aws_cognito_user_pool.octopus_user_pool.id
    user_pool_endp      = aws_cognito_user_pool.octopus_user_pool.endpoint
    user_pool_client_id = aws_cognito_user_pool_client.octopus_storage_client.id

    bucket_name   = aws_s3_bucket.octopus_storage_user_bucket.id
    user_role_arn = aws_iam_role.cognito_up_list_users_role.arn

  }
}

# admin app userdata config

data "template_file" "admin_userdata_config" {
  template = file("./config_templates/userdata.sh.tmpl")
  vars = {
    region_id = "us-east-1"

    user_pool_id            = aws_cognito_user_pool.octopus_user_pool.id
    user_pool_client_id     = aws_cognito_user_pool_client.octopus_admin_client.id
    user_pool_client_secret = aws_cognito_user_pool_client.octopus_admin_client.client_secret

    aws_access_key_id     = aws_iam_access_key.admin_octopus_storage_service_key.id
    aws_secret_access_key = aws_iam_access_key.admin_octopus_storage_service_key.secret
  }
}