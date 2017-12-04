#!/bin/sh
echo " =========================== "
echo "| >>> setup environment <<< |"
echo " =========================== "
usermod -aG docker vagrant
systemctl start docker
systemctl enable docker
mkdir /home/vagrant/mongodata
mkdir /home/vagrant/redisdata
# document persistence layer
docker run --name documentdb -p 27017:27017 -v /home/vagrant/mongodata:/data/db -d mongo
# session cache
docker run --name scache -p 6379:6379 -v /home/vagrant/redisdata:/data -d redis redis-server --appendonly yes
