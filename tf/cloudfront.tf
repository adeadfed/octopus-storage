data "aws_iam_policy_document" "s3_bucket_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.octopus_storage_frontend_bucket.arn}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.octopus_storage_cloudfront.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "cloudfront_bucket_policy" {
  bucket = aws_s3_bucket.octopus_storage_frontend_bucket.bucket
  policy = data.aws_iam_policy_document.s3_bucket_policy.json
}

resource "aws_cloudfront_origin_access_control" "cloudfront_s3_oac" {
  name                              = "CloudFront S3 OAC"
  description                       = "CloudFront OAC for Octopus Storage S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "octopus_storage_cloudfront" {
  origin {
    domain_name = aws_s3_bucket.octopus_storage_frontend_bucket.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.octopus_storage_frontend_bucket.bucket

    origin_access_control_id = aws_cloudfront_origin_access_control.cloudfront_s3_oac.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Distribution for Octopus Storage front-end assets"
  default_root_object = "index.html"

  aliases = []

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.octopus_storage_frontend_bucket.bucket

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  depends_on          = [aws_s3_object.octopus_storage_frontend_config]
  wait_for_deployment = true
}