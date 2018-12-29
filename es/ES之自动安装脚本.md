
## 背景
最近项目需求，引入了 ES。

一番了解，发现 ES 安装非常简单， 但存在以下几个问题：

在 Linux 下不能以 root 账号启动  
> 安装时需被动创建服务账号、变更目录所属用户等操作， 且每次启动程序时都需变更到服务用户，特别繁琐。

 一般需配合插件使用
 > 每换一个环境(开发、测试、生产、项目)都要重新安装插件。每个插件的安装步骤、功能验证方法各不相同，都需一一操作，繁琐。

生产环境部署
> 除安装外，生产环境还需考虑 程序启动/停止/重启/状态查询、防火墙开放端口、开机自启、功能验证等各个方面。 

故特地准备了一个集成安装包和安装脚本，自动处理上述所有问题，节约时间。

同时也可以此为参考，微做改动便可适用其它服务。

## 版本及插件
Elasticsearch
> 2.4.6  ( 支持 jdk 7 )

head插件

ik插件

## 目录结构
```
├── Readme.md  # 安装文档
├── Es-Standalone.tar.gz
│   ├── elasticsearch-2.4.6.tar.gz # ES 安装包
│   ├── elasticsearch-init # 服务脚本
│   ├── elasticsearch.yml # 配置文件
│   ├── install.sh # 安装脚本
│   └── uninstall.sh # 卸载脚本

```

## 安装文档

```
###  解压 
tar -xzf Es-Standalone.tar.gz

### 按需修改ES默认配置文件
vim ./elasticsearch.yml

....
# 集群名称 默认 elasticsearch
# cluster.name: my-application

# ip绑定， 默认 127.0.0.1, 只允许本机访问
network.host: 0.0.0.0

# http 端口， 默认 9200
# http.port: 9200
...

....
# 其它配置按需设置...
...

### 给安装脚本添加执行权限
chmod +x *.sh

### 执行 install.sh 脚本
./install.sh

### 服务相关命令
service elasticsearch {start|stop|restart|force-reload|status}

### 浏览器测试

# ES功能
http://ip:port
# head插件
http://ip:port/_plugin/head/
# ik插件
http://ip:port/_analyze?text=测试分词&tokenizer=ik_max_word
```

## 安装脚本

```bash
#!/bin/sh

echo "### 开始安装 Elasticsearch ###"

ES_VERSION=2.4.6

echo "### ES版本号: ${ES_VERSION} ###"
echo "### 插件: head、ik ###"

ES_HOME=/home/elasticsearch
ES_PACKAGE=elasticsearch-${ES_VERSION}.tar.gz
ES_HTTP_PORT=9200
ES_TCP_PORT=9300


echo "### 创建 ${ES_HOME} 目录并解压: ${ES_PACKAGE}  ###"

mkdir ${ES_HOME} \
&& tar xzf ${ES_PACKAGE} -C ${ES_HOME} --strip-components=1

echo "### 添加 elasticsearch 用户 ###"
groupadd -r elasticsearch \
&& useradd -r -s /usr/sbin/nologin -M -c "Elasticsearch service user" -g elasticsearch elasticsearch \

echo "### 变更 ${ES_HOME} 所属用户 ###"
chown -R elasticsearch:elasticsearch ${ES_HOME}

echo "### ${ES_HOME}/bin/elasticsearch 添加执行权限 ###"
chmod +x ${ES_HOME}/bin/elasticsearch

echo "### 检测 JAVA 环境 ###"
if [ -x "$JAVA_HOME/bin/java" ]; then
   JAVA="$JAVA_HOME/bin/java"
else
    JAVA=`which java`
fi

if [ ! -x "$JAVA" ]; then
    echo " 安装失败, 请安装 JAVA 并设置 JAVA_HOME "
    exit 1
fi

echo "### 添加服务启动脚本 /etc/init.d/elasticsearch ###"
cp ./elasticsearch-init /etc/init.d/elasticsearch
sed -i -e 's#^JAVA_HOME=$#JAVA_HOME='$JAVA_HOME'#' /etc/init.d/elasticsearch
sed -i -e 's#^ES_HOME=$#ES_HOME='$ES_HOME'#' /etc/init.d/elasticsearch
chmod +x /etc/init.d/elasticsearch

echo "### 覆盖配置文件 ###"

HTTPPORT=$(awk '/^http.port:/ {print $2}' ./elasticsearch.yml)
if [ ${HTTPPORT} ]; then
    ES_HTTP_PORT=${HTTPPORT}
    echo "### 检测到http.port: ${ES_HTTP_PORT} ###"
fi

cp ./elasticsearch.yml ${ES_HOME}/config/elasticsearch.yml

echo "### 添加开机启动 ###"
chkconfig --add elasticsearch

echo "### 安装成功 ###"

echo "### 启动 Elasticsearch ###"
service elasticsearch start

echo "### 开启防火墙端口 ${ES_HTTP_PORT} , ${ES_TCP_PORT} ### "
firewall-cmd --zone=public --add-port=${ES_HTTP_PORT}/tcp --permanent
firewall-cmd --zone=public --add-port=${ES_TCP_PORT}/tcp --permanent
firewall-cmd --reload

echo "### 可在浏览器输入以下地址测试 ###"

echo "### ES功能 ###"
echo " http://ip:port "
echo "### head插件 ###"
echo " http://ip:port/_plugin/head/ "
echo "### ik插件 ###"
echo " http://ip:port/_analyze?text=测试分词&tokenizer=ik_max_word "


```

## 服务脚本

```
#!/bin/bash
#
# /etc/init.d/elasticsearch -- startup script for Elasticsearch
#
### BEGIN INIT INFO
# Provides:          elasticsearch
# Required-Start:    $network $remote_fs $named
# Required-Stop:     $network $remote_fs $named
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Starts elasticsearch
# Description:       Starts elasticsearch using start-stop-daemon
### END INIT INFO

# 服务名称
NAME=elasticsearch

# 服务描述
DESC=" Elasticsearch Server "

# 检查当前用户是否为 root 用户
if [ `id -u` -ne 0 ]; then
    echo "You need root privileges to run this script"
    exit 1
fi

# ES 用户
ES_USER=elasticsearch
# ES 用户组
ES_GROUP=elasticsearch

# JAVA HOME 目录
JAVA_HOME=

export JAVA_HOME

# ES HOME 目录
ES_HOME=

# PID 文件路径
PID_FILE="$ES_HOME/$NAME.pid"

# ES启动程序路径
DAEMON=$ES_HOME/bin/elasticsearch

# 守护进程启动参数
DAEMON_OPTS="-d -p $PID_FILE "

# 检查 DAEMON 是否可执行
if [ ! -x "$DAEMON" ]; then
    echo "The elasticsearch startup script does not exists or it is not executable, tried: $DAEMON"
    exit 1
fi

# Exit if any command (outside a conditional) fails.
set -e

case "$1" in
  start)
    echo "Starting $DESC"
    # 如果 pid 文件存在 且进程存在，表示ES已经运行
    if [ -e "$PID_FILE" ]; then
      if ps auxw | grep $(cat $PID_FILE) | grep -v grep > /dev/null; then
        echo "Already running on pid $(cat $PID_FILE)"
        exit 0
      else
        echo 'not running (but PID file exists), remove $PID_FILE'
        rm $PID_FILE
      fi
    fi

    # 创建 pid 文件， 变更所属 USER 和 GROUP
    touch "$PID_FILE" && chown "$ES_USER":"$ES_GROUP" "$PID_FILE"

    # 以 $ES_USER 用户启动 ES
    runuser -s /bin/bash $ES_USER -c "$DAEMON $DAEMON_OPTS"

    if [ $? == 0 ]
    then
      echo "started."
    else
      echo "failed."
    fi
    ;;
  stop)
    if [ ! -e $PID_FILE ]; then
      echo "$DESC not running (no PID file)"
    else
      echo "Stopping $DESC"
      kill $(cat $PID_FILE)
      rm $PID_FILE

      if [ $? == 0 ]
      then
        echo "stopped."
      else
        echo "failed."
      fi

    fi
    ;;

  status)
    if [ ! -f $PID_FILE ]; then
      echo "$DESC not running"
    else
      if ps auxw | grep $(cat $PID_FILE) | grep -v grep > /dev/null; then
      echo "running on pid $(cat $PID_FILE)"
      else
      echo 'not running (but PID file exists)'
      fi
    fi
    ;;

  restart|force-reload)
    if [ -f "$PID_FILE" ]; then
       $0 stop
    fi
    sleep 0.5
    $0 start
    ;;

  *)
    echo "Usage: $0 {start|stop|restart|force-reload|status}"
    exit 1
    ;;
esac

exit 0
```

## 参考资料

[https://github.com/spujadas/elk-docker](https://github.com/spujadas/elk-docker)