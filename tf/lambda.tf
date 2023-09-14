data "archive_file" "lambda_trigger_code_zip" {
  type        = "zip"
  source_file = "../lambda/lambda.js"
  output_path = "../lambda/lambda_trigger_code.zip"
}

resource "aws_lambda_function" "cognito_post_confirmation_trigger_lambda" {
  function_name    = "cognito-post-confirmation-trigger-lambda-${random_id.tf_id.hex}"
  filename         = data.archive_file.lambda_trigger_code_zip.output_path
  source_code_hash = data.archive_file.lambda_trigger_code_zip.output_base64sha256
  runtime          = "nodejs16.x"
  handler          = "lambda.handler"
  role             = aws_iam_role.cognito_trigger_lambda_role.arn
}

resource "aws_lambda_permission" "allow_cognito" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cognito_post_confirmation_trigger_lambda.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.octopus_user_pool.arn
}