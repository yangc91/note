HTTPSS证书制作笔记
===

参考资料
---
[Android HTTPS 自制证书实现双向认证](http://www.jianshu.com/p/64172ccfb73b")


制作证书
---

```
keytool -genkeypair -alias client -keyalg RSA -validity 3650 -keypass 123456 -storepass 123456 -keystore client.jks
# keytool -genkeypair -alias client -keyalg RSA -validity 3650 -dname "CN=127.0.0.1,OU=icesoft,O=icesoft,L=Haidian,ST=Beijing,c=cn" -keypass 123456 -storepass 123456 -keystore client.jks

keytool -genkeypair -alias server -keyalg RSA -validity 3650 -keypass 123456 -storepass 123456 -keystore server.keystore

keytool -export -alias client -file client.cer -keystore client.jks -storepass 123456

keytool -export -alias server -file server.cer -keystore server.keystore -storepass 123456

keytool -import -v -alias server -file server.cer -keystore truststore.jks -storepass 123456

keytool -import -v -alias client -file client.cer -keystore server.keystore -storepass 123456
```

使用证书
---

>客户端使用

需要truststore.jks 和 client.jks 制作的bks


> 浏览器使用

需导入p12证书， 将jks转为p12后，导入浏览器

```
keytool -importkeystore -srckeystore client.jks -srcstoretype JKS -deststoretype PKCS12 -destkeystore client.p12
```

tomcat配置
---

```
#tomcat server.xml
<Connector port="8443" URIEncoding="UTF-8" protocol="HTTP/1.1" SSLEnabled="true"
               maxThreads="150" minSpareThreads="25"
                           maxSpareThreads="75"
                           enableLookups="false" disableUploadTimeout="true"
                           acceptCount="100" debug="0" scheme="https" secure="true"
               clientAuth="true" sslProtocol="TLS"
         keystoreFile="conf/server.keystore" keystorePass="123456"
               truststoreFile="conf/server.keystore" truststorePass="123456"/>
```

> 单向认证改动`clientAuth`即可，`clientAuth="false"`