redis在windows下注册为服务
====

1. 下载, [windows版地址](https://github.com/MicrosoftArchive/redis "windows版下载地址")
1. 安装服务
  ```
  #安装服务
  redis-server --service-install redis.windows-service.conf --loglevel verbose
  #指定服务名称
  redis-server --service-install redis.windows-service.conf --service-name test
  #指定端口
  redis-server --service-install --service-name test --port 10001
```
1. 卸载服务
    > redis-server --service-uninstall
1. 启动服务
    > redis-server --service-start
1. 停止服务
    > redis-server --service-stop