#!/bin/bash

#yum install -y libkrb5-dev
yum install -y git
cd /tmp
git clone https://github.com/llafuente/vagrant
cd vagrant/
sh prepare-instance.sh
sh disable-selinux.sh
sh mongodb.sh
sh node.sh
