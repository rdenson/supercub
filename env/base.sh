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
echo "%%%%%>  install mongodb-org-tools"
# need some way to run mongodump and mongorestore
# vi /etc/yum.repos.d/mongodb-org.repo
#
# [mongodb-org-3.4]
# name=MongoDB Repository
# baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/3.4/x86_64/
# gpgcheck=1
# enabled=1
# gpgkey=https://www.mongodb.org/static/pgp/server-3.4.asc
#
# yum install -y mongodb-org-tools
echo "%%%%%>  cleaning up after yum"
yum clean all -y
