# CAS服务端安装

## 下载 Overlay 模板

[github地址](https://github.com/apereo/cas-overlay-template)

部署CAS 服务端，最简单的方式就是使用CAS官方提供的Overlay模板，直接可构建出任意版本的 cas war 包。

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20200403173840.png)

cas-overlay-template最新版本只支持Gradle构建，如果习惯使用maven，可以选择了支持maven构建的5.3版本，下载后引入 IDE 中即可。因本人也是习惯使用maven，因此选择了v5.3。

## 配置 maven 镜像

很多公共的maven仓库都在国外，国内访问速度非常慢，因此建议配置国内镜像。
推荐使用 阿里云maven镜像。

[阿里云镜像配置文档](https://help.aliyun.com/document_detail/102512.html?spm=a2c40.aliyun_maven_repo.0.0.36183054eGKhsV)

## 构建 war 包
```
/build.sh package
```
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20200403174120.png)

> build.sh 中涵盖了很多方法，如复制配置文件、生成证书、springboot运行、debug运行等等

## 配置文件及证书
```
# 将配置文件复制到 /etc/cas 路径下
 ./build.sh copy
# 生成证书并复制到 /etc/cas 路径下
./build.sh gencert
```

## 配置服务

新建 main、resources 目录：

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20200403174428.png)
将java目录设置为源码目录，resources目录设置为资源目录。

添加配置：
```
vim application.properties


...
cas.serviceRegistry.initFromJson=true
#自动扫描服务配置，默认开启
#cas.serviceRegistry.watcherEnabled=true
#120秒扫描一遍
cas.serviceRegistry.schedule.repeatInterval=120000
#延迟15秒开启
# cas.serviceRegistry.schedule.startDelay=15000
##
# Json配置
cas.serviceRegistry.json.location=classpath:/services

```

## Spring boot 启动
```
./build.sh bootrun 
```

## 验证

访问:  https://127.0.0.1:8443/cas/login 显示默认登录页面

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20200403174811.png)

默认账号：

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20200403174837.png)

认证成功：

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20200403174856.png)