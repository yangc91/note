# Centos安装shadowsock进行http/https代理

## shadowsock

> 安装
```
pip install shadowsocks
```
> 编辑配置文件
```
vim /etc/shadowsocks.json

{
    "server":"ip",
    "server_port":port,
    "local_address": "127.0.0.1",
    "local_port":1080,
    "password":"password",
    "timeout":300,
    "method":"aes-256-cfb",
    "fast_open": false
}
```

> 启动
sslocal -c /etc/shadowsocks.json -d start

## proxychains(转发http/https流量)

> 安装

```
yum install privoxy
```

> 编辑配置文件
```
vim /etc/privoxy/config
....
# 默认监听端口
listen-address 127.0.0.1:8118 
# 转发到本地端口 
forward-socks5t / 127.0.0.1:1080 . 
...

```

> 重启privoxy
```
systemctl restart  privoxy
```

> 设置代理
```
vim /etc/profile

# 添加代理地址
...
export http_proxy=http://127.0.0.1:8118
export https_proxy=http://127.0.0.1:8118
...

# 生效
source /etc/profile
```

```
# 检测
curl ip.gs
```

## 取消代理
```
unset http_proxy
unset https_proxy
```

## 文档
[https://github.com/Shadowsocks-Wiki/shadowsocks/blob/master/zh_CN/shadowsocks/linux-setup-guide.md](https://github.com/Shadowsocks-Wiki/shadowsocks/blob/master/zh_CN/shadowsocks/linux-setup-guide.md)