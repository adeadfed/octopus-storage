# Octopus Storage

## What is it?
**Octopus Storage** is a vulnerable serverless web app for uploading and sharing files between users, that utilizes AWS Cognito, S3 and Lambda services and implements common attack vectors on **AWS Cognito**. 


## Vectors
 1. **Misconfigured user role permissions** on AWS resources.
 2. Non-default User Pool **roles**, that can be **assumed to escalate privileges**.
 3. **User Pool identities** used to authenticate to **multiple resources**.
 4. SSTI in **developer application using server-side login flow** to leak  developer credentials for Cognito from environment.
 5. RCE in **User Pool Lambda trigger** to perform privileged actions on Cognito service or achieve a foothold in the infrastructure. 

