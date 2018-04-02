# tomcat注册为服务
***

## windows
1. 必须下载window版tomcat:
   apache-tomcat-7.0.85-windows-x64.zip
1. 进入tomcat bin目录:
   >service.bat install 'test' // 如果服务名称有空格隔开，则需单引号
1. 执行后查看windows的服务，可发现 `Apache Tomcat test`,可设置开机自启等
1. 从服务中卸载:
   >service.bat remove 'test'

## linux
1. 下载并解压
1. ```bash
    vim tomcat/bin/catalina.sh
    #添加环境变量
    JAVA_HOME=/usr/lib/jvm/jdk1.7.0_45
    CATALINA_HOME=/usr/local/tomcat7
   ```
1. `cp catalina.sh /etc/init.d/tomcat`
1. `service tomcat start|stop`
