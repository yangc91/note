## 资料

[SSH原理与运用（一）：远程登录](http://www.ruanyifeng.com/blog/2011/12/ssh_remote_login.html)

[Generating a new SSH key and adding it to the ssh-agent](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)

## 口令登录

```
ssh user@host
```

指定端口

```
ssh -p port user@host
```

## 公钥登录

### 生成公钥

```
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"


Generating public/private rsa key pair.

Enter a file in which to save the key (/Users/you/.ssh/id_rsa): [Press enter]

Enter passphrase (empty for no passphrase): [Type a passphrase]

Enter same passphrase again: [Type passphrase again]

```

之后在 $HOME/.ssh/     目录下，会新生成两个文件：id_rsa.pub 和  id_rsa, 前者是公钥，后者是私钥

### 复制公钥至服务器

```
ssh-copy-id user@host
```

指定端口

```
ssh-copy-id -p port user@host
```

之后ssh登录就不需要输入密码了。

如果无法登录，检查 /etc/ssh/sshd_config 文件中以下配置是否放开

```
RSAAuthentication yes
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
```

重启 ssh 服务

```
service ssh restart
```