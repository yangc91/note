使用fail2ban防止服务器被暴力破解实践
===

>fail2ban是一个通过监视系统日志，匹配日志的错误信息执行相应的屏蔽操作(借用防火墙规则)以达到保护服务器的工具。

[github网址](https://github.com/fail2ban/fail2ban)

安装要求
---
>Python2 >= 2.6 or Python >= 3.2 or PyPy

安装
---

```
# 解压
tar -xzvf fail2ban-0.9.4.tar.gz

cd fail2ban-0.9.4

# 安装
python setup.py install

# fail2ban将被安装在python的包目录中。 其可执行脚本被放置到 /usr/bin 目录下， 配置信息在 /etc/fail2ban

# 测试是否安装成功
fail2ban-client -h

# 启动脚本
cp files/redhat-init /etc/init.d/fail2ban

```

配置
---

>提供两种配置方式
  - 使用配置文件， 在 /etc/fail2ban 目录下
  - 使用fail2ban-client

>以配置文件为例：

1. fail2ban.conf

>该文件为软件自身的配置，日志界别、日志路径等等，为默认配置即可，无需修改。如有需要，可新建fail2ban.local文件覆盖需变更的配置即可

2. jail.conf

>该文件负责业务配置，官方推荐新建jail.local 或 在jail.d目录下新建*.conf文件 覆盖默认配置， 因为软件升级时该文件可能被覆盖；

现直接以该文件为例， 查阅fail2ban的各配置项。

```
# 默认日志路径配置（如mail、authpriv、user、ftp等等），依据系统而定，fail2ban在/etc/fail2ban/目录下提供了多种系统日志配置文件
before = paths-fedora.conf
# before = paths-debian.conf

[DEFAULT]                      #全局配置

ignoreip = 127.0.0.1           #忽略的IP列表，该Ip表将不受限制

bantime = 600                  #被屏蔽时间， 单位：秒

findtime  = 600                #时间间隔，这个时间段内超过规定次数的主机将会被屏蔽

maxretry = 5                   #最大尝试此时

enabled = false                #全局禁止，在jail.local或jail.d/*.conf中开启相关联的配置


destemail = root@localhost     #邮件接收人
sender = root@localhost        #邮件发送人


# action：触发后的动作

#只屏蔽主机
action_ = %(banaction)s[name=%(__name__)s, bantime="%(bantime)s", port="%(port)s", proto    col="%(protocol)s", chain="%(chain)s"]

#屏蔽主机 并发送邮件
action_mw = %(banaction)s[name=%(__name__)s, bantime="%(bantime)s", port="%(port)s", pro    tocol="%(protocol)s", chain="%(chain)s"]
    %(mta)s-whois[name=%(__name__)s, sender="%(sender)s", dest="%(destemail)s",     protocol="%(protocol)s", chain="%(chain)s"]

.......


action = %(action_)s   #默认动作为只屏蔽主机，如需修改，只需在特定服务下配置该属性即可


#服务配置， 以sshd 为例

[sshd]
# 开启防护
enabled = true
# 动作，只屏蔽（action_为默认动作，可省略）
action = %(action_)s
# 时间范围（s）
findtim = 120
# 时间范围内最大尝试次数
maxretry = 3
# 屏蔽时间（s）
bantime = 180

port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s

#保存后启动fail2ban
service fail2ban start
```

验证功能
---

```
#使用另外一台主机（11.12.109.125）尝试登陆，故意输错3次密码：
[root@localhost ~]# ssh root@11.12.109.123
root@11.12.109.123's password:
Permission denied, please try again.
root@11.12.109.123's password:
Permission denied, please try again.
root@11.12.109.123's password:
^C
[root@localhost ~]# ssh root@11.12.109.123
ssh: connect to host 11.12.109.123 port 22: Connection refused

#可知道该主机已经被屏蔽成功


#在服务器上查看防火墙规则
[root@ychost ~]# iptables -nL
#其中有一项Chain f2b-sshd
Chain f2b-sshd (1 references)
target     prot opt source               destination
REJECT     all  --  11.12.109.125        0.0.0.0/0            reject-with icmp-port-unreachable
RETURN     all  --  0.0.0.0/0            0.0.0.0/0

# 被屏蔽的主机会在iptables中显示， 当达到设定的屏蔽时间后，该规则会自动删除
```

至此，fail2ban已经配置完成，可防止别人使用ssh暴力破解系统登录密码， 至于其它服务器，用户可按同样的方法自己配置。

