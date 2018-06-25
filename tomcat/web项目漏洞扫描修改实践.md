web项目漏洞扫描修改实践
===

前一段笔者负责的项目进行了安全渗透测试，现总结一下，以便有需要的读者使用。

问题
---

* redis未授权访问漏洞
* 猜测出远程SNMP服务存在可登录的用户名口令
* 反射型跨站脚本编制漏洞（即xss）
* UI信息泄露
* cookie未设置HttpOnly属性
* 敏感信息泄露
* 支持不安全的http方法
* 密码复杂度策略
* 账号锁定策略

redis未授权访问漏洞
---

> 即其它机器无需密码可直接连接redis

三种解决方案：

1. 只有本机访问, 开启防火墙，主机只对外暴露ssh和web服务端口, 防火墙命令参考[iptables实践](https://github.com/yangc91/note/blob/master/linux/iptables%E5%AE%9E%E8%B7%B5.md)
1. 只有本机访问，编辑`redis.conf`文件
```
vim redis.conf

...
# 此时连接主机只能输入127.0.0.1，不可输入主机真实ip(默认)
bind 127.0.0.1
...

# 启动redis
./redis-server /etc/redis.conf &

```
1. 需要远程访问时，编辑`redis.conf`文件
```
vim redis.conf

...

# bind必须为0.0.0.0或主机的某个网口ip，其它机器才能进行远程连接
bind 0.0.0.0

....


# Warning: since Redis is pretty fast an outside user can try up to
# 150k passwords per second against a good box. This means that you should
# use a very strong password otherwise it will be very easy to break.

# 配置密码，redis速度极快，密码应该设置的非常复杂避免很快被暴力破解，
# 同时建议配合方案一使用防火墙限定指定源ip访问redis端口
requirepass foobared

...

# 启动redis
./redis-server /etc/redis.conf &

```

猜测出远程SNMP服务存在可登录的用户名口令
---

> 未使用snmp服务时，直接关闭该服务即可； 如有使用，团体名设置复杂一点，不要使用默认的publlic

反射型跨站脚本编制漏洞（即xss）
----

参考[SpringMvc防御XSS实践](https://github.com/yangc91/note/blob/master/java/SpringMvc%E9%98%B2%E5%BE%A1XSS%E5%AE%9E%E8%B7%B5.md)

UI信息泄露
---

> 针对“账号不存在” 和 “密码错误” 等情况，统一提示“用户名或密码错误”，防止额外泄露信息

cookie未设置HttpOnly属性
---

```
vim tomcat/conf/contenxt.xml

<!-- 给cookies设置HttpOnly属性 tomcat/conf/context.xml-->
<Context useHttpOnly="true">

```
> 新版tomcat默认就是HttpOnly

敏感信息泄露
---

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

支持不安全的http方法
---

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

密码复杂度策略
---

> 设置密码规则，数字+大小写字母+特殊字符等组合形式，按项目场景自行选择

帐户锁定策略
---

> 防止暴力破解，连续错误指定次数，对账号进行冻结，联系管理员进行解冻。我们项目到这种程度即可，大家可按自己项目场景，自由设计冻结、解冻策略，
如10分钟内连续错误指定次数，进行冻结，冻结24小时后自动解冻，该策略也可适用于api限速场景（限定用户指定期间内访问api的次数）。












