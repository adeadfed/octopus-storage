# Octopus Storage

## What is this?
**Octopus Storage** is a vulnerable web application, bundled with the series of **AWS Cognito Security** research articles, available at [LSG Europe website](https://lsgeurope.com). **Octopus Storage** is a cloud file hosting service that enables users to upload and share files. It is built as a server-less web application, and uses common AWS services with the help of frontend AWS JS SDK and Cognito service. 


## Deployment

 1. Install [terraform](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli) 
 2. Configure an administrator-level AWS credentials for terraform to [use](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration)
 3. Clone the repo and deploy it:
 ```
 git clone https://github.com/adeadfed/octopus-storage
 cd octopus-storage
 cd tf
 terraform init
 terraform apply
 ```
 4. Terraform should yield the URLs for the freshly deployed web applications after the apply:
 ```
 ubuntu@ubuntu:~$ terraform apply
 ...
 Outputs:

 octopus_admin_ssh_key = <sensitive>                 
 octopus_admin_user_credentials = <sensitive>        
 octopus_admin_web_url = "http://EC2-PUBLIC-IP.compute-1.amazonaws.com"
 octopus_storage_web_url = "https://CLOUDFRONT-ID.cloudfront.net"
 ```
 5. Sensitive terraform outputs
 You can access sensitive outputs like so:
 ```
 terraform output -raw *output_name*
 ```
 `octopus_admin_ssh_key` can be used to access the EC2 running the Octopus Admin web app. <br>
 `octopus_admin_user_credentials` can be used to log into `octopus_admin` User Pool user.

## Available Attack Vectors
 1. **Editable** custom User Pool attributes that lead to a privilege escalation (use Flask app in `user-pool-attributes-app/app.py`).
 2. SSTI in **developer application with server-side login flow** that can be used leak developer credentials.
 3. RCE in **User Pool Lambda trigger** that can be abused to perform privileged actions on Cognito service or achieve a foothold in the infrastructure.  
 4. Shared **User Pool** used to authenticate to **multiple applications**.
 5. Flawed **rule-based role mapping** that can be bypassed to obtain administrator credentials (optional; swap from option 1 to option 2 in lines 110-130 in `cognito.tf`). 
 6. **Misconfigured Identity Pool role permissions** for horizontal privilege escalation.
 7. **Misconfigured Identity Pool role permissions** for vertical privilege escalation via excessive **AWS Cognito permissions**. 


## Authors
- Maksym Vatsyk
    - [LinkedIn](https://www.linkedin.com/in/maksym-vatsyk/)
    - [Twitter](https://twitter.com/adeadfed)
- Pavel Shabarkin
    - [LinkedIn](https://www.linkedin.com/in/pavelshabarkin/)
    - [Twitter](https://twitter.com/shabarkin)
