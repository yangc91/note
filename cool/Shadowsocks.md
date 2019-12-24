# Shadowsocks服务端安装

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20191127201218.png)

> 因原本的shadowsocks不支持 AES-256-GCM，日常写代码找资料很不方便，故将服务进行了升级

## 安装

[Shadowsocks SS一键4合一安装包](https://blog.upx8.com/2249) 

```
# 启动
/etc/init.d/shadowsocks-python start | stop | restart | status

# 配置文件
/etc/shadowsocks-python/config.json
```

## BBR加速
> BBR 是 Google 开源的 TCP BBR 拥塞控制算法，并提交到了 Linux 内核，最新的 4.10 版内核已经用上了该算法。

[一键安装最新内核并开启 BBR 加速脚本](https://umrhe.com/a-key-to-install-the-latest-kernel-and-open-the-bbr-acceleration-script.html) 

> 搬瓦工可直接选择安装了bbr的系统，尝试安装bbr plus时，直接将系统搞崩溃，慎重~

## google云300美金

[google云教程](https://github.com/bigdongdongCLUB/newGCP/issues/1) 