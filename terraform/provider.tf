terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.67"
    }
  }

  required_version = ">= 1.2.0"
}
provider "aws" {
  region = "us-east-1"
  access_key = "AKIAZ2QZTD6CSWCTBEUR"
  secret_key = "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" 
}