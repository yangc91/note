## Navicate  Premium 12.0.28在MAC下激活实践

> 最近入手了mac，经历了痛苦的开发环境搭建之路，特此整理记录一下，以便以后需要的时候使用。

### Navicate Premium

Navicate Premium 是一个非常好用的多连接数据库开发工具。无奈太贵了，企业版￥9999，非商业版￥3999，对于国内的大多数同行来说是真的付不起，因此才会在网上找些免费激活的教程，此文也是从网上搜集资料整理而来。当然只是想帮助无法承担价格支又非常需要的个人开发者，如有能力的用户或企业使用，建议还是支持正版。

### 参考资料

> 有大神整理并放入GitHub上，1800+star

[navicat-keygen](https://github.com/DoubleLabyrinth/navicat-keygen/blob/mac/README.zh-CN.md)

### 个人激活实践步骤
- 安装openssl(已经安装则跳过)
    - 如有`brew`,则可以通过`brew install openssl`安装
    - 如需安装`brew` ：[官网](https://brew.sh/index_zh-cn)选择语言执行安装命令即可


- 下载激活项目
```bash  
# 下载激活程序
git clone https://github.com/DoubleLabyrinth/navicat-keygen.git
# 切换mac分支
git checkout -b mac origin/mac
```

- 编译
```
cd navicat-keygen
make release

cd navicat-patcher
make release

```

- 运行补丁
```
cd navicat-patcher
./navicat-patcher /Applications/Navicat\ Premium.app/Contents/MacOS/Navicat\ Premium

./navicat-keygen 2048key.pem
# 按提示选择语言，获得Snkey

# 输入用户名、组织,然后此时需输入请求码，在此处暂停，执行下一步获得请求码   

```

- 打开navicate
    - 点击注册
    - 输入上一步获取的Snkey，提示失败，选择手动激活
    - 弹出请求码
    - 将请求码复制到上一步的命令行中，然后回车换行，会自动返回激活码
    - 将激活码复制到navicate中，点击激活，成功。
