tomcat漏扫修复及调优
===

环境
---

* Centos7 8G
* tomcat7

nessus漏扫修复
---

###12085 - Apache Tomcat Servlet / JSP Container Default Files

* 删除tomcat/webapps/下example、doc、manager，（ROOT保留，内部只留下自定义的404页面）

###35291 - SSL Certificate Signed Using Weak Hashing Algorithm
###42873 - SSL Medium Strength Cipher Suites Supported
###20007 - SSL Version 2 and 3 Protocol Detection


> https证书签名算法强度不够，默认生成的是1024位，需要升级为2048， 指定Cipher，禁用ssl2.0 ssl3.0

> 证书制作参考[HTTPSS证书制作笔记](https://blog.csdn.net/a120717/article/details/80746312)
> 注意：需要指定证书长度：
```
keytool -genkeypair -alias server -keyalg RSA -keysize 2048 -sigalg SHA256withRSA -validity 3650 -keypass 123456 -storepass 123456 -keystore server.keystore`
```
> 修改`server.xml`,指定`keystoreFile`、`truststoreFile`、`sslProtocol`、`sslEnabledProtocols`

```
<Connector port="8443" URIEncoding="UTF-8" protocol="HTTP/1.1" SSLEnabled="true"
             maxThreads="150" minSpareThreads="25"
		   maxSpareThreads="75"
		   enableLookups="false" disableUploadTimeout="true"
		   acceptCount="100" debug="0" scheme="https" secure="true"
             clientAuth="false" sslProtocol="TLS" sslEnabledProtocols="TLSv1,TLSv1.1,TLSv1.2"  ciphers="TLS_ECDHE_RSA_WITAES_128_CBC_SHA256,TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA,TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384,TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA,TLS_RSA_WITH_AES_128_CBC_SHA256,TLS_RSA_WITH_AES_128_CBC_SHA,TLS_RSA_WITH_AES_256_CBC_SHA256,TLS_RSA_WITH_AES_256_CBC_SHA"  keystoreFile="conf/server.keystore" keystorePass="123456"
             truststoreFile="conf/server.keystore" truststorePass="123456"/>
```

###cookie未设置HttpOnly属性

```
vim tomcat/conf/contenxt.xml

<!-- 给cookies设置HttpOnly属性 tomcat/conf/context.xml-->
<Context useHttpOnly="true">

```
> 新版tomcat默认就是HttpOnly

###敏感信息泄露

> 输入一个不存在的地址时，泄露tomcat版本号等信息

自定义tomcat的404页面

```
#在ROOT下自定义一个404.html，其它都删除即可

# 配置tomcat 404页面
vim conf/web.xml

...
#添加如下配置
<error-page>
    <error-code>404</error-code>
    <location>/404.html</location>
 </error-page>
...

```

###支持不安全的http方法

* 修改tomcat的web.xml文件配置禁用options/PUT/DELETE这三种方法
```
# 在 <webapp></webapp>标签中添加：
<security-constraint>
   <web-resource-collection>
      <url-pattern>/*</url-pattern>
      <http-method>PUT</http-method>
      <http-method>DELETE</http-method>
      <http-method>HEAD</http-method>
      <http-method>OPTIONS</http-method>
      <http-method>TRACE</http-method>
   </web-resource-collection>
   <auth-constraint>
   </auth-constraint>
 </security-constraint>
<login-config>
  <auth-method>BASIC</auth-method>
</login-config>
```
* 删除tomcat/webapps/下example、doc、manager，（ROOT保留，内部只留下自定义的404页面）

性能调优
---

###jvm参数优化

```
vim catalina.sh

...
# 添加jvm参数配置
JAVA_OPTS="$JAVA_OPTS -XX:PermSize=128M -XX:MaxPermSize=256M -Xms1024M -Xmx1024M -Xss512k"
...

```

###并发线程优化

```
vim server.xml

...

<Connector port="8443" URIEncoding="UTF-8" protocol="HTTP/1.1" SSLEnabled="true"
               maxThreads="1024" maxConnections="1024" minSpareThreads="25" acceptCount="150"
                           enableLookups="false" disableUploadTimeout="true"
                            debug="0" scheme="https" secure="true"
               clientAuth="false" sslProtocol="TLS"  ciphers="TLS_ECDHE_RSA_WITAES_128_CBC_SHA256,TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA,TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384,TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA,TLS_RSA_WITH_AES_128_CBC_SHA256,TLS_RSA_WITH_AES_128_CBC_SHA,TLS_RSA_WITH_AES_256_CBC_SHA256,TLS_RSA_WITH_AES_256_CBC_SHA"  keystoreFile="conf/server.keystore" keystorePass="123456"
               truststoreFile="conf/server.keystore" truststorePass="123456"/>

```

> 参数说明：
* acceptCount: 请求等待队列大小，默认100（tomcat没有空闲线程处理请求时放入该队列缓存起来），超出该队列大小后，拒绝连接
* maxConnections： tomcat最大并发连接数，bio默认是maxThreads数量，nio和nio2默认是10000，arp默认8192
* minSpareThreads： 线程池最小线程数，默认10
* maxThreads: 线程池最大线程数，默认200

