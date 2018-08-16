# linux服务启动脚本实践

> 后台开发在部署、修改配置、升级服务时，需经常进行启动、关闭等操作
> 常规的做法：
> - 启动: 敲一行执行启动命令，
> - 关闭： 执行`ps aux | grep xxx`，查到进程号，在执行 `kill -9 xxx`
> - 修改配置文件后又得先关闭，在启动

无数次的重复非常繁琐，故写个shell脚本解放双手还是很有必要的。
本文是做项目中写的一个小脚本，简单实用，特此总结一下。

## 目标
> 需支持
  - usage
  - start
  - stop
  - restart
  - status

## 思路：
### usage
>输出 `Usage: $0 { start | stop | restart | status }`
### start:
>检测是否有pid文件，有则提示已经启动，无则执行启动命令，成功时将新进程号写入pid文件，
失败时提示异常
### stop
>检测是否有pid文件，无则提示未启动，有则执行`kill -9 $PID ` 命令，删除pid文件
### restart
>先执行stop，再执行start
### status
>检测是否有pid文件，无则提示未启动，有则提示$PID,pid文件路径,进程相关信息

```bash
#!/bin/sh
# $0 表shell命令第一个参数，即脚本本身
# $(dirname $0) 定位脚本文件所在的目录
BASE_DIR=$(dirname $0)
# $(basename $0 .sh) 定位脚本名称，.sh表示去除.sh后缀
PID=$(dirname $0)/$(basename $0 .sh).pid

#USER=root

status() {
  # -f 表判断变量是否存在
  if [ -f $PID ]
  then
    echo "--- Started, Pid file: $( cat $PID ) [$PID] ---"
    ps -ef | grep -v grep | grep $( cat $PID )
  else
    echo "---No Pid file---"
  fi
}

start() {
    if [ -f $PID ]
    then
        echo "---Already started. PID: [$( cat $PID )]---"
    else
      # 测试命令，以启动redis命令为例
      /usr/local/src/redis-server /etc/redis.conf &

      # $? 为上条命令执行结果，成功执行则返回0
      if [[ "$?" -eq 0 ]];
      then
        # $! 为上条shell命令的进程号，如执行成功，则将进程号写入pid文件
        echo $!>$PID
        echo "START success"
      else
        echo "---START failure, please check----"
      fi
    fi
}

stop() {
  if [ -f $PID ]
  then
    # 执行kill的几种命令方式
    # kill -9 `ps -ef | grep -v grep | grep $CMD | grep -w $USR | awk '{print $2}'`
    # echo `cat $PID` | xargs kill -9
    kill -9 `cat $PID`
    sleep 1
    /bin/rm $PID
    echo "Stop success"
  else
    echo "---No pid file---"
  fi
}

case "$1" in
  'start')
    start
    ;;

  'stop')
    stop
    ;;

  'restart')
    stop
    sleep 1
    start
    ;;

  'status')
    status
    ;;

  *)
    echo "Usage: $0 { start | stop | restart | status }"
    exit 1
    ;;
esac

exit 0
```
