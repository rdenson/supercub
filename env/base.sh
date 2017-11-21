#!/bin/sh
echo " ===================== "
echo "| >>> base config <<< |"
echo " ===================== "
yum update -y
echo "%%%%%>  minimum dev environment needs"
yum install -y wget ntp git unzip net-tools
echo "%%%%%>  install docker"
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum install -y docker-ce
echo "%%%%%>  cleaning up after yum"
yum clean all -y
