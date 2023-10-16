# s3 bucket with static frontend
resource "aws_s3_bucket" "octopus_storage_frontend_bucket" {
  bucket        = "octopus-storage-frontend-bucket-${random_id.tf_id.hex}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "block_public_access_frontend_bucket" {
  bucket                  = aws_s3_bucket.octopus_storage_frontend_bucket.bucket
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

locals {
  mime_types = {
    "css"   = "text/css"
    "html"  = "text/html"
    "ico"   = "image/vnd.microsoft.icon"
    "js"    = "application/javascript"
    "json"  = "application/json"
    "map"   = "application/json"
    "png"   = "image/png"
    "svg"   = "image/svg+xml"
    "jpg"   = "image/jpeg"
    "txt"   = "text/plain"
    "ttf"   = "font/ttf"
    "woff"  = "font/woff"
    "woff2" = "font/woff2"
    "eot"   = "application/vnd.ms-fontobject"
  }
}

resource "aws_s3_object" "octopus_storage_frontend_files" {
  for_each     = fileset("../client-app", "**")
  bucket       = aws_s3_bucket.octopus_storage_frontend_bucket.bucket
  key          = each.key
  source       = "../client-app/${each.value}"
  content_type = lookup(tomap(local.mime_types), element(split(".", each.key), length(split(".", each.key)) - 1))
  etag         = filemd5("../client-app/${each.value}")
}

resource "aws_s3_object" "octopus_storage_frontend_config" {
  bucket       = aws_s3_bucket.octopus_storage_frontend_bucket.bucket
  key          = "assets/js/config.js"
  content      = data.template_file.frontend_js_config_template.rendered
  content_type = "application/javascript"
  etag         = md5(data.template_file.frontend_js_config_template.rendered)
}

# s3 bucket for users to store their data
resource "aws_s3_bucket" "octopus_storage_user_bucket" {
  bucket        = "octopus-storage-user-bucket-${random_id.tf_id.hex}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "block_public_access_user_bucket" {
  bucket                  = aws_s3_bucket.octopus_storage_user_bucket.bucket
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "octopus_storage_user_bucket_cors" {
  bucket = aws_s3_bucket.octopus_storage_user_bucket.bucket

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "DELETE"]
    allowed_origins = ["*"]
  }
}