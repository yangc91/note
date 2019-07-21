
## docker mysql image

[image url](https://hub.docker.com/_/mysql?tab=description)

## 启动 `mysql` 实例

```
docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:tag
```

> some-mysql 是容器名称， my-secret-pw 是 root 账户密码， tag 是 mysql 版本

```
docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7.26
```


## 连接

```
# 方式一： 本地连接
docker exec -i -t some-mysql bash
mysql -uroot -p


# 方式二： 容器远程连接

# 查询 some-mysql ip
docker inspect some-mysql
# -h 后的 ip 替换为 some-mysql 容器的ip
docker run -it  --rm mysql:5.7.26 mysql -h172.17.0.2 -uroot -p

# 方式三：主机远程连接

# -p参数添加主机映射端口
docker run --name some-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7.26
# 使用主机的 navicate 等工具连接
```

## 进入容器
```
docker exec -it some-mysql bash
```

## 查看日志
```
docker logs some-mysql
```


## 使用自定义配置文件
> Mysql默认的配置文件为 `/etc/mysql/my.cnf`, 不包含 `/etc/mysql/conf.d`、`/etc/mysql/mysql.conf.d`等文件夹

如果自定义配置文件目录为 `/my/custom/config-file.cnf` ， 则可使用如下命令启动容器：
```
docker run --name some-mysql -v /my/custom:/etc/mysql/conf.d -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7.26
```

mysql 实例启动时会结合使用 `/etc/mysql/my.cnf`、 `/etc/mysql/conf.d/config-file.cnf` 配置

## 环境变量

 - MYSQL_ROOT_PASSWORD root账户密码
 - MYSQL_DATABASE 容器启动时自动创建数据库
 - MYSQL_USER, MYSQL_PASSWORD 自动创建用户及密码，会赋予该用户 MYSQL_DATABASE 所指定数据库的所有权限

 ## 数据存储
```
# 绑定主机目录
docker run --name some-mysql -v /my/own/datadir:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7.26
# or
# docke volume
docker run --name some-mysql --mount source=mysql-vol,target=/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7.26

```

## 备份

```
docker exec some-mysql sh -c 'exec mysqldump --all-databases -uroot -p"$MYSQL_ROOT_PASSWORD"' > /some/path/on/your/host/all-databases.sql
```

## 恢复

```
docker exec -i some-mysql sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' < /some/path/on/your/host/all-databases.sql
```
