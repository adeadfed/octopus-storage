# user pool group role
resource "aws_iam_role" "cognito_up_list_users_role" {
  name = "aws-cognito-bad-practice-list-users-role"

  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : "sts:AssumeRoleWithWebIdentity",
        "Principal" : {
          "Federated" : "cognito-identity.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cognito_power_user_policy" {
  role       = aws_iam_role.cognito_up_list_users_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonCognitoPowerUser"
}

# identity pool authenticated role
resource "aws_iam_policy" "cognito_ip_octopus_storage_policy" {
  name = "cognito-ip-octopus-storage-policy"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ],
        "Resource" : [
          aws_s3_bucket.octopus_storage_user_bucket.arn,
          "arn:aws:s3:::*/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role" "cognito_ip_auth_role" {
  name = "cognito-ip-octopus-storage-role"

  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : "sts:AssumeRoleWithWebIdentity",
        "Principal" : {
          "Federated" : "cognito-identity.amazonaws.com"
        },
        "Condition" : {
          "StringEquals" : {
            "cognito-identity.amazonaws.com:aud" : aws_cognito_identity_pool.octopus_identity_pool.id
          },
          "ForAnyValue:StringLike" : {
            "cognito-identity.amazonaws.com:amr" : "authenticated"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cognito_ip_auth_role_policy_attachment" {
  role       = aws_iam_role.cognito_ip_auth_role.name
  policy_arn = aws_iam_policy.cognito_ip_octopus_storage_policy.arn
}

# admin app IAM credentials
resource "aws_iam_user" "admin_octopus_storage_service" {
  name = "admin-octopus-storage-service"
}

resource "aws_iam_access_key" "admin_octopus_storage_service_key" {
  user = aws_iam_user.admin_octopus_storage_service.name
}

resource "aws_iam_user_policy_attachment" "admin_octopus_storage_policy" {
  user       = aws_iam_user.admin_octopus_storage_service.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

# lambda role
resource "aws_iam_role" "cognito_trigger_lambda_role" {
  name = "cognito-post-confirmation-trigger-lambda-role"

  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "sts:AssumeRole"
        ],
        "Principal" : {
          "Service" : [
            "lambda.amazonaws.com"
          ]
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cognito_trigger_lambda_role_policy_attachment" {
  role       = aws_iam_role.cognito_trigger_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}