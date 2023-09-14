# user pool
resource "aws_cognito_user_pool" "octopus_user_pool" {
  name              = "Octopus User Pool"
  mfa_configuration = "OFF"

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
  auto_verified_attributes = ["email"]

  alias_attributes = ["preferred_username", "email"]

  lambda_config {
    post_confirmation = aws_lambda_function.cognito_post_confirmation_trigger_lambda.arn
  }
}

# user pool client for frontend & identity pool
resource "aws_cognito_user_pool_client" "octopus_storage_client" {
  name = "Octopus Storage Client"

  user_pool_id = aws_cognito_user_pool.octopus_user_pool.id
}



# user pool backend client
resource "aws_cognito_user_pool_client" "octopus_admin_client" {
  name         = "Octopus Admin Client"
  user_pool_id = aws_cognito_user_pool.octopus_user_pool.id

  generate_secret = true

  explicit_auth_flows = ["ALLOW_ADMIN_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
}

# user pool groups with IAM role assigned
resource "aws_cognito_user_group" "aws_cognito_bad_practice_list_users_group" {
  name         = "aws-cognito-bad-practice-list-users-group"
  user_pool_id = aws_cognito_user_pool.octopus_user_pool.id
  role_arn     = aws_iam_role.cognito_up_list_users_role.arn
}

resource "aws_cognito_user_group" "aws_cognito_storage_users_group" {
  name         = "storage-users-group"
  user_pool_id = aws_cognito_user_pool.octopus_user_pool.id
  role_arn     = aws_iam_role.cognito_ip_auth_role.arn
}

# identity pool
resource "aws_cognito_identity_pool" "octopus_identity_pool" {
  identity_pool_name               = "Octopus Identity Pool"
  allow_unauthenticated_identities = false
  cognito_identity_providers {
    client_id     = aws_cognito_user_pool_client.octopus_storage_client.id
    provider_name = aws_cognito_user_pool.octopus_user_pool.endpoint
  }
}

resource "aws_cognito_identity_pool_roles_attachment" "storage_role" {
  identity_pool_id = aws_cognito_identity_pool.octopus_identity_pool.id

  roles = {
    "authenticated" = aws_iam_role.cognito_ip_auth_role.arn
  }
  
  role_mapping {
    identity_provider = "${aws_cognito_user_pool.octopus_user_pool.endpoint}:${aws_cognito_user_pool_client.octopus_storage_client.id}"
    ambiguous_role_resolution = "AuthenticatedRole"
    type = "Token"
  }
}