resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "octopus_admin_ssh_key" {
  key_name   = "octopus-admin-web-app-ssh-key-${random_id.tf_id.hex}"
  public_key = tls_private_key.ssh_key.public_key_openssh
}

# data "aws_ami" "ubuntu" {
#   most_recent = true
#   owners      = ["amazon"]
#   filter {
#     name   = "architecture"
#     values = ["arm64"]
#   }
#   filter {
#     name   = "name"
#     values = ["ubuntu*"]
#   }
# }

resource "aws_security_group" "octopus_admin_web_app_sg" {
  name        = "octopus-admin-web-app-sg-${random_id.tf_id.hex}"
  description = "Allow port 80 HTTP access to the web app"
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

resource "aws_instance" "octopus_admin_web_app_ec2" {
  # ami           = data.aws_ami.ubuntu.id
  ami           = "ami-0a0c8eebcdd6dcbd0" # Canonical, Ubuntu, 22.04 LTS, arm64 jammy image build on 2023-05-16
  instance_type = "t4g.nano"
  user_data     = data.template_file.admin_userdata_config_template.rendered
  key_name      = aws_key_pair.octopus_admin_ssh_key.key_name
  tags = {
    Name = "octopus-admin-web-app-ec2-${random_id.tf_id.hex}"
  }
  vpc_security_group_ids = [aws_security_group.octopus_admin_web_app_sg.id]
}