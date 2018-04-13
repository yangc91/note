# iptables实践

## 目录
## [自定义firewall](#自定义firewall)
## [多个网卡接口](#多个网卡接口)
## [放行特定IP](#放行特定IP)
## [端口及协](#端口及协)

## 自定义firewall
```
#!/bin/bash
#
# iptables 样例设置脚本

# 默认放开所有输入
iptables -P INPUT ACCEPT

#
# 清除 iptables 内一切现存的规则
#
 iptables -F
#
# 容让 SSH 连接到 tcp 端口 22
# 当通过 SSH 远程连接到服务器，你必须这样做才能群免被封锁于系统外
#
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
#
# 设置 INPUT、FORWARD、及 OUTPUT 链的缺省政策
#
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT
#
# 设置 localhost 的访问权
#
iptables -A INPUT -i lo -j ACCEPT
#
# 接纳属于现存及相关连接的封包
#
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

#
# 存储设置
#
service iptables save

#
# 列出规则
#
iptables -L -v
```
## 多个网卡接口
```
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -i eth0 -j ACCEPT
```

## 放行特定IP
```
# 接纳来自被信任 IP 地址的封包
iptables -A INPUT -s 192.168.0.4 -j ACCEPT # change the IP address as appropriate

# 接纳来自被信任 IP 地址的封包
iptables -A INPUT -s 192.168.0.0/24 -j ACCEPT  # using standard slash notation
iptables -A INPUT -s 192.168.0.0/255.255.255.0 -j ACCEPT # using a subnet mask

# 接纳来自被信任 IP 地址、mac的封包
iptables -A INPUT -s 192.168.0.4 -m mac --mac-source 00:50:8D:FD:E6:32 -j ACCEPT
```

## 端口及协议
```
# 接纳目标端口是 6881 号（bittorrent）的 tcp 封包
iptables -A INPUT -p tcp --dport 6881 -j ACCEPT

#在这里我们附加（-A）一条规则到 INPUT 链，配对 tcp 协议（-p tcp）及从 6881 目标端口进入我们的机器（--dport 6881）。
#注： 要配对目标或来源端口（--dport 或 --sport），你必须先指定协议（tcp、udp、icmp、all）。

# 接纳目标端口是 6881-6890 号的 tcp 封包
iptables -A INPUT -p tcp --dport 6881:6890 -j ACCEPT
```