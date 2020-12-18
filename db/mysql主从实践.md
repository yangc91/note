# mysql8 主从实践

## 主机环境
```
192.168.1.204(master)
192.168.1.203(slave-1)
192.168.1.202(slave-2)
```

## 下载 mysql8

[下载地址](https://dev.mysql.com/downloads/mysql/)

[Yum Repository下载地址](https://dev.mysql.com/downloads/repo/yum/)

## 安装

[Yum 安装文档](https://dev.mysql.com/doc/mysql-yum-repo-quick-guide/en/)

```bash
# 在三台机器上都按以下步骤安装 mysql
# 添加 MySQL Yum Repository
sudo rpm -Uvh mysql80-community-release-el7-3.noarch.rpm
# 安装mysql
sudo yum install mysql-community-server -y
```

## Master

### 启动
```bash
sudo systemctl start mysqld.service
# 查看状态
systemctl status mysqld.service
```

### 登录、修改密码

```bash
# 初次启动时，mysql会默认创建 'root'@'localhost' 账号，查看并修改自动生成的密码
grep 'temporary password' /var/log/mysqld.log

  2020-11-30T03:03:31.947703Z 6 [Note] [MY-010454] [Server] A temporary password is generated for root@localhost: uWblh>vd#6%L

# 登录 并修改密码  WITH mysql_native_password 表示指定加密插件
# MySQL8.0 引入并默认使用新插件 caching_sha2_password，导致后续配置比较麻烦，建议设置密码时指定 mysql_native_password
mysql -uroot -p
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Learn@123!';
```

### 创建同步账号
``` bash
# 创建同步账号
CREATE USER 'slave'@'192.168.1.203' IDENTIFIED WITH mysql_native_password BY 'Learn@123';
CREATE USER 'slave'@'192.168.1.202' IDENTIFIED WITH mysql_native_password BY 'Learn@123';

# 授予同步权限
GRANT REPLICATION SLAVE ON *.* TO 'slave'@'192.168.1.203';
GRANT REPLICATION SLAVE ON *.* TO 'slave'@'192.168.1.202';
# 刷新权限
FLUSH PRIVILEGES;
```

### 修改配置
```conf
vim /etc/my.conf

# 配置全局唯一节点
server-id=204

# binlog 配置
# mysql 8.0 默认已经开启了 binlog
# 配置binlog文件名称
log-bin=mysql-bin

# 需同步的数据库，如不配置则全部同步
# binlog-do-db=test_db

# binlog日志保留天数，下面的 天 或 秒 指定一个即可，mysql 8.0 默认使用秒,30天时间
# expire-logs-days=10
# binlog_expire_logs_seconds = 2592000

# 刷新策略，mysql 8.0 默认是此配置
# innodb_flush_log_at_trx_commit=1 
# sync_binlog=1

#------- my.conf end ----

# 重启mysql
systemctl restart mysqld.service

```

### 锁表

> 新开一个会话，锁定所有表，主从同步完成前，不接受新数据
```sql
FLUSH TABLES WITH READ LOCK;
```

### 查看 master 状态
```bash
mysql> show master status \G;
```
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20201130151219.png)


## Slave

### 启动
同master

### 配置
```conf
vim /etc/my.conf
# 配置全局唯一节点
server-id=203 | 202

# ----- my.conf end ----

# 重启
systemctl restart mysqld.service
```

### 手动同步数据

> 如果 Master 上已经有业务数据，需先将数据导出，手动同步至 Slave 上
```sql
-- 备份 master 数据，没有--master-data参数，需新启动一个客户端手动锁定所有表(即上面的锁表会话)
mysqldump --all-databases > dbdump.sql
--  --master-data=2 参数会在生成的sql中自动添加 'CHANGE MASTER TO...' 的语句
mysqldump --all-databases --master-data=2 > dbdump.sql

-- slave 导入数据
mysql source < dbdump.sql
mysql < dbdump.sql
```

### 配置 Master
```sql
mysql> CHANGE MASTER TO
MASTER_HOST='192.168.1.204',
MASTER_USER='slave',
MASTER_PASSWORD='Learn@123',
MASTER_LOG_FILE='mysql-bin.000001', -- 对应 show master status中的值
MASTER_LOG_POS=156; -- 对应 show master status中的值
```

### 开启同步
``` sql
show slave status\G;
start slave;
show slave status\G;

-- 若出现异常，可使用 stop slave，修改配置后再执行 start slave

```

## Master 释放全局锁
```sql
-- 同步完成时推出即可释放锁（最后阶段）
UNLOCK TABLES;
```

## 创建业务账号
``` bash
# 在 Master 创建业务账号
CREATE USER test IDENTIFIED WITH mysql_native_password BY 'Learn@123';
# 授权, dbname替换为业务数据库名
GRANT ALL PRIVILEGES ON {dbname}.* TO 'test'@'%' WITH GRANT OPTION;
# 刷新权限
FLUSH PRIVILEGES;
```

## 问题

> 修改root密码后登录提示密码错误

```sql
-- 指定密码插件 mysql_native_password
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Learn@123';
```

> 账号连接被拒绝
```bash

vim /etc/my.con
# 屏蔽密码登录
skip-grant-tables

# 重启
systemctl restart mysqld.service

# 再次登录，输入密码时直接回车，然后按正确方式修改密码即可
mysql -uroot -p

#修改密码
flush privileges; # 先执行，否则 alter 报错
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Learn@123';

## 去掉 skip-grant-tables，重启mysql
```

> 主从报错：Authentication plugin 'caching_sha2_password' reported error:Authentication require secure connection

[主从复制报错2061](https://www.modb.pro/db/29919)

> 主、从库账号重复问题

[https://blog.csdn.net/weixin_42942173/article/details/103742788](https://blog.csdn.net/weixin_42942173/article/details/103742788)