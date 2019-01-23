
## 下载
```bash
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-6.4.2.zip

```

## 建立elsearch用户和组

```bash
# es不能以root用户启动，需新建用户
groupadd elsearch
# 建立组
useradd elsearch -g elsearch

```

## 移至elsearch用户home目录并解压
```bash
mv elasticsearch-6.4.2.zip  /home/elsearch/
unzip elasticsearch
```

## 变更文件所属用户
```bash
chown -R elsearch:elsearch elasticsearch
```

## 切换用户
```bash
su - elsearch
```

## 变更网络设置,默认只允许本机连接
```bash
vim elasticsearch/config/elasticsearch.yml
network.host: 0.0.0.0
```

## 启动
```bash
# 普通启动
./bin/elasticsearch

# 守护进程启动
./bin/elasticsearch -d
```

## 更多
> 以上只是简单介绍了ES的基本安装步骤，如需在服务器上使用，建议参考 [ES之自动安装脚本](https://github.com/yangc91/note/blob/master/es/ES%E4%B9%8B%E8%87%AA%E5%8A%A8%E5%AE%89%E8%A3%85%E8%84%9A%E6%9C%AC.md)。