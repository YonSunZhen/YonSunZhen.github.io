---
title: 基于centos7.5.1804安装mysql-8.0.19
date: 2020-03-18 10:41:00
tags:
categories: 后端
---
## 详细过程  
1、MySql官网下载安装包。[点击下载](https://dev.mysql.com/downloads/mysql/)
![](http://qiniu.yonsunzhen.cn/markdown%2Fimg%2Flinux%2Fmysql.png)
2、上传安装包到云服务器指定文件夹并解压，我们这里将安装目录指定为 `/usr/local/mysql8`  
3、在mysql8根目录下新建文件夹data，用于存放数据  
4、创建 mysql 用户组和 mysql 用户
```
groupadd mysql
useradd -g mysql mysql
```
5、改变mysql8目录权限
```
chown -R mysql.mysql /usr/local/mysql8/
```
6、初始化数据库
- 创建mysql_install_db安装文件
```
mkdir mysql_install_db
chmod 777 ./mysql_install_db
```
- 初始化，在mysql8目录下执行以下命令
```
bin/mysqld --initialize --user=mysql --basedir=/usr/local/mysql8 --datadir=/usr/local/mysql8/data
/usr/local/mysql8/bin/mysqld (mysqld 8.0.11) initializing of server in progress as process 5826
[Server] A temporary password is generated for root@localhost: twi=Tlsi<0O!
/usr/local/mysql/bin/mysqld (mysqld 8.0.11) initializing of server has completed
```
记录自己的临时密码 `twi=Tlsi<0O!`
- 以上执行如果报错 `bin/mysqld: error while loading shared libraries: libnuma.so.1: ` 
是因为缺少`numactl` 安装一下即可
```
yum -y install numactl
```
7、配置mysql
```
cp /usr/local/mysql8/support-files/mysql.server /etc/init.d/mysqld
```
- 修改my.cnf文件
```
vim  /etc/my.cnf
```
如下面所示：
```
[mysqld]
#  skip-grant-tables 表示首次使用mysql时跳过密码验证 当自己忘记记录临时密码时可用
#  skip-grant-tables 
    basedir = /usr/local/mysql8  
    datadir = /usr/local/mysql8
    socket = /usr/local/mysql8/mysql.sock
    character-set-server=utf8
    port = 3306
    sql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
[client]
    socket = /usr/local/mysql8/mysql.sock
    default-character-set=utf8
```
8、建立MySql服务，在mysql8根目录下执行以下命令
```
cp -a ./support-files/mysql.server /etc/init.d/mysqld
```
- 添加到系统服务
```
chkconfig --add mysql
```
- 检查服务是否生效
```
chkconfig  --list mysqld
```
9、配置全局环境变量
```
 vi /etc/profile
```
- 在 profile 文件底部添加如下两行配置，保存后退出
```
export PATH=$PATH:/usr/local/mysql8/bin:/usr/local/mysql8/lib
```
- 设置环境变量立即生效
```
 source /etc/profile
```
10、启动MySQL服务
```
service mysql start
```
11、登录MySQL，执行以下命令后输入刚才那个临时密码
```
mysql -u root -p
```
12、操作数据库前必须将临时密码设置为别的。
报错信息为` You must reset your password using ALTER USER statement before executing this statement`  
MySQL版本5.7.6版本开始的用户可以使用如下命令：[详情见](https://blog.csdn.net/muziljx/article/details/81541896)
```
mysql> ALTER USER USER() IDENTIFIED BY 'your password';
```

## 问题集锦
1、MySQL官网下载太慢的解决方法：[详情见](https://blog.csdn.net/thm211633/article/details/99197923)  
2、Navicat远程连接云服务器上的MySQL失败（1251 client does not support authentication protocol requested by server;consider upgrading Mysql client 
ERROR 1396 (HY000): Operation ALTER USER failed for 'root'@'localhost'）：[详情见](https://blog.csdn.net/q258523454/article/details/84555847)
```
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';
```


## MySql8配置
1、`mysql -u root -p` 输入密码  
2、初次使用修改密码命令：`ALTER USER USER() IDENTIFIED BY 'Xiaoming250';`  
3、`show databases；` 显示所有数据库  
4、`quit;` 退出mysql命令行编辑
