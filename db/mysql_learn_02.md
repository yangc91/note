# 02_更新sql如何执行
>[极客时间_Mysql_实战45讲_林晓斌] 学习笔记

## 基本示意图
> 查询语句所走的流程，更新语句同样会执行一遍。

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20191120224727.png)

> 注： 更新语句会清除该表所有的缓存

## 两个日志模块
> 更新语句涉及两个重要的日志模块：redo log（重做日志）、binlog（归档日志）

### redo log

> 如果每一次更新都写入磁盘，首先需要查找该记录然后更新，IO、查找成本太高。因此使用WAL（write Ahead Logging）技术，先写日志，再写磁盘。

更新记录时：InnoDB引擎先记录redo log并更新内存，此次更新就算完成了。同时，在适当的时候（系统较闲），引擎将该记录更新到磁盘中。

redo log 是由固定大小的，从头开始写，到末尾再回到开头。如可以配置一组4个，每个文件1GB

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20191124193405.png)

wirte pos 是当前位置，边写边往后移，到结尾后回到开头

checkpoint 是当前要擦除的位置，擦除之前要把记录更新到数据文件

wirte pos 追上 checkpoint，表示日志写满了，需停下来，擦除一些数据

InnoDB使用 redo log 保证即使数据库异常重启，之前提交的记录也不丢失，称为crash-safe。

### binlog
Mysql分为两层：server层、引擎层。

其中redo log 属于 InnoDB 引擎特有的，而 binlog 则属于 server 的日志

Mysql 自带的引擎 MyISAM 没有 crash-safe，binlog 只能用于归档。 InnoDB 是以插件的形式引入到 Mysql 中，其使用 redo log 提供了 crash-safe 能力。


### 区别

  1. redo log 属于 InnoDB 引擎特有，binlog 则属于 Mysql， 所有引擎都可使用
  2. redo log 是物理日志（对数据页的操作），binlog 是逻辑日志（原始逻辑）
  3. redo log 是循环写，binlog 可以追加写

## update 执行流程（InnoDB）
  1. 查询 id=2 的行，引擎使用树搜索到这一行，如果行所在数据页在内存中，直接返回，否则从磁盘读入内存再返回
  2. 执行器拿到数据，更新值，调用引擎接口写数据
  3. 引擎将数据更新到内存中，记录 redo log，此时 redo log 处于 prepare 状态
  4. 执行器生成 binlog， 并将 binlog 写入磁盘
  5. 调用引擎提交事物接口，把 redo log 改成 commit 状态，更新完成

  ![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20191124195419.png)

## 两阶段提交

> 让两份日志之间的逻辑一致

## 配置
innodb_flush_log_at_trx_commit 设置为 1，表每次事物 redo log 都持久化到磁盘，可保证 mysql 异常重启后数据不丢失

sync_binlog 设置为 1，表每次事物 binlog 都持久化到磁盘，可保证 mysql 异常重启后 binlog 不丢失
