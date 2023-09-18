terraform {
  backend "s3" {
    bucket         = "remote-backend" 
    key            = "terraform.tfstate"
    region         = "us-east-1"  
    encrypt        = true
    dynamodb_table = "remote-backend"

  }
}
