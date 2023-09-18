//Launch EC2 instance with same keypair and Security Group
resource "aws_instance" "AppInstance" {
  depends_on = [
    aws_security_group.rules
  ]
  ami           = "ami-0f844a9675b22ea32"
  instance_type = "t2.micro"
  vpc_security_group_ids = [aws_security_group.rules.id]
  security_groups = ["${aws_security_group.rules.name}"]
  key_name = "keypair-01"
  user_data = file("ec2-userdata.bash")

  connection {
    type        = "ssh"
    user        = "ec2-user" # Tùy thuộc vào AMI và cấu hình của bạn
    private_key = file("./keypair-01.pem") # Đường dẫn đến khóa riêng tư của bạn
    host        = aws_instance.AppInstance.public_ip # Sử dụng public IP của máy ảo EC2
  }

  provisioner "remote-exec" {
    inline = [
      "sudo yum install httpd php git -y",
      "sudo systemctl restart httpd",
      "sudo systemctl enable httpd"
    ]
  }

  tags = {
    name = "AppInstance"
  }
}



//create EBS and mount to /var/www/html of EC2
resource "aws_ebs_volume" "EBS" {
  depends_on = [
    aws_instance.AppInstance
  ]
  availability_zone = aws_instance.AppInstance.availability_zone
  size              = 1
  type = "gp2"
  tags = {
    Name = "app_storage"
  }
}

//Attach EBS to Instance
resource "aws_volume_attachment" "EBS_Attach" {
  depends_on = [
    aws_ebs_volume.EBS
  ]
  device_name = "/dev/sdh"
  volume_id   = aws_ebs_volume.EBS.id
  instance_id = aws_instance.AppInstance.id
  force_detach = true
}

//clone code in /var/www/html

resource "null_resource" "Remote" {
  depends_on = [
    aws_volume_attachment.EBS_Attach
  ]
  connection {
    type     = "ssh"
    user     = "ec2-user"
    private_key = file("./keypair-01.pem")
    host     = aws_instance.AppInstance.public_ip
  }
  provisioner "remote-exec" {
    inline = ["sudo mkfs.ext4 /dev/xvdh",
      "sudo mount /dev/xvdh /var/www/html",
      "sudo rm -rf /var/www/html/*",
      "sudo git clone https://github.com/nguyenquockhang1610/website-media-cdn  /var/www/html"
    ]
  }
}

//Them kho S3 da co san vao terraform
data "aws_s3_bucket" "web-streamingmedia" {
  bucket = "web-streamingmedia-01"
}

//Doc du lieu tu kho S3
data "aws_s3_objects" "object" {
  bucket = data.aws_s3_bucket.web-streamingmedia.id
}

# Ghi đè lên tệp tin index.html
resource "aws_s3_object" "index_html" {
  bucket       = data.aws_s3_bucket.web-streamingmedia.id
  key          = "index.html"
  source       = "./web/index.html"   # Đường dẫn tới tệp index.html cục bộ
  content_type = "text/html"
  etag         = filemd5("./web/index.html")
}

# Ghi đè lên tệp tin style.css
resource "aws_s3_object" "style_css" {
  bucket       = data.aws_s3_bucket.web-streamingmedia.id
  key          = "styles.css"
  source       = "./web/styles.css"    # Đường dẫn tới tệp style.css cục bộ
  content_type = "text/css"
  etag         = filemd5("./web/styles.css")
}

# Ghi đè lên tệp tin script.js
resource "aws_s3_object" "script_js" {
  bucket       = data.aws_s3_bucket.web-streamingmedia.id
  key          = "script.js"
  source       = "./web/script.js"    # Đường dẫn tới tệp script.js cục bộ
  content_type = "application/javascript"
  etag         = filemd5("./web/script.js")
}


data "aws_cloudfront_distribution" "website" {
  id = "E1Y8DP98BA22SM"
  
}

data "aws_route53_zone" "route53-zone" {
  name = "nguyenquockhang1610.net" 
}

//Tao ban sao EBS 
resource "aws_ebs_snapshot" "AppInstance_snapshot" {
  volume_id = aws_ebs_volume.EBS.id
  depends_on = [
    aws_ebs_volume.EBS
  ]
  tags = {
  Name = "AppInstance_snapshot"
  }

}
// launch the Application
resource "null_resource" "nulllocal1" {
  depends_on = [
    data.aws_cloudfront_distribution.website
  ]

  provisioner "local-exec" {
    command = "xdg-open http://${aws_instance.AppInstance.public_ip}"
  }
}



