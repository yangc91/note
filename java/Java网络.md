高性能网络编程涉及操作系统、底层协议栈、高级语言封装等，如果孤立的学习某一部分，很容易造成迷茫与困惑。本文尝试将各个环节串联起来，并讨论网络编程在各个环节性能优化的方向，希望对大家有所帮助。

下面我们以Http Server为例，站在服务端角度将整个流程分成了5个阶段并分别进行讨论。

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210507110127.png)


## 阶段1：TCP三次握手
Http协议底层使用TCP协议进行数据传输，首先需要经过三次握手创建TCP连接。

服务端收到Syn请求后将连接信息存入SYN队列(半连接队列)，响应ACK + Syn； 之后收到客户端Ack数据包， 再将连接信息从 SYN队列 转入 Accept队列(全连接队列)，此时握手结束，连接创建成功。

本阶段的重点就是这两个队列

### Accept队列

表示队列中连接都已经创建成功，此时在等待应用程序调用accept()函数接收进行后续的业务处理。

#### 队列长度取值
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210507151016.png)

SOMAXCONN为系统配置，可通过 `cat /proc/sys/net/core/somaxconn` 命令查看，默认128；
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210507150821.png)

SO_BACKLOG则由应用程序创建server socket时自己指定。

下面是常见的配置场景,相信大家相当熟悉：

Java socket：
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210507150221.png)

tomcat：
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210507150504.png)

netty:
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210507145828.png)

#### 队列溢出策略
队列溢出策略由系统配置 `tcpaborton_overflow` 控制

> tcpaborton_overflow = 0 , server会扔掉client发过来的 ack；

> tcpaborton_overflow = 1 , server会返回一个reset包，表示废弃这个连接，客户端将看到`connection reset by peer`异常

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210507161133.png)

在高并发情况下，当应用程序accept()过慢或accept队列长度过小时容易出下队列溢出。

#### 优化方式：
- 增大Accept队列长度(somaxconn,backlog)
- 提升accept()速度（下一阶段再做讨论）

### Syn队列
Syn队列表示半连接队列，此队列中的连接还缺少第三次握手过程。

#### 队列长度取值
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210507160629.png)
> 此时的syn只是理论值，实际上会经过很复杂的条件判断，详情请查看小林coding的《TCP半连接队列和全连接队列》

#### 队列溢出策略
队列溢出策略由系统配置 `tcp_syncookies` 控制

> tcp_syncookies = 0, 直接丢弃

> tcp_syncookies = 1，此时连接可绕过Syn队列

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210507162812.png)

遭受SYN攻击或高并发场景下Syn队列长度过小容易出现溢出；

#### 优化方式
- 增大Syn队列长度(max_syn_backlog,somaxconn,backlog三个参数共同决定)
- 设置tcp_syncookies = 1 

## 阶段2：获取连接创建子Socket
此阶段server不断的从accept队列中获取新连接、创建相应的子socket进行后续的数据读、写。

优化方式则是accept()获取并创建子socket后，尽快进行下一次accept()，避免accept队列积压连接。

具体代码实现如下：
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210507171554.png)


前面两个阶段为基础，后面三个阶段才包含真正的业务处理，也是高性能网络编程优化的重点。
下面我们以一次Http请求为例进行后续3个阶段的讨论
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210508155351.png)

## 阶段3: socket等待数据可读+读取阶段
client端的请求数据通过网络传输至server端网卡，由DMA将数据复制到Socket读缓冲区(cpu不参与复制，省略协议栈相关处理流程)，之后服务端才可以将数据读至(cpu copy)应用内存中。

也就是说当server端调用 read 系统调用时，数据可能未准备好(即还未到达socket读缓冲区）。此时我们可以阻塞线程直到数据准备好再进行后续的复制操作；也可以采用其它策略，如直接返回error，提示数据未准备好。

针对上述情况，操作系统抽象出了5种IO模型，分别是 BIO、NIO、IO多路复用、信号驱动、异步IO。

Java支持四种(除了信号驱动)，我们分别进行讨论：

> BIO

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210512165133.png)

BIO模型下当数据未到达Socket读缓冲区，线程会阻塞等待直到可读。阻塞会会造成线程切换，而且线程被唤醒到真正被调度执行是由操作系统控制，本身也存在一定的延迟，因此整体开销会非常大。

> NIO

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210512172408.png)

NIO与BIO的区别在于：当数据不可读时也会直接返回(0）,不阻塞线程从而节省线程上下文切换的开销。  但为了读到数据处理业务请求，我们的程序需要加入自旋读。当网络延迟低的时候数据很快到达，性能会比BIO提升较高；如果网络延迟较高，自旋会耗费大量的CPU时间，造成资源浪费。

> IO多路复用

BIO、NIO都未能很好解决线程等待IO数据到达的问题，后续又出现了性能更好的IO多路复用模型，

IO多路复用模型引入Selector选择器并将socket及其关注的事件(connect、accept、read、write等)注册到上面。 

当我们调用其 select()方法时，线程会阻塞直到某个socket出现相应的事件，此时数据IO等待阶段已经结束, 后续的操作线程无需阻塞也无需自旋。

虽然select()方法会阻塞线程，但Selector的优势在于可以同时监控成千上万个sockt，支持以极低的资源(一个线程)支持大量的客户端。

Selector的实现有 selector/poll/epoll,性能依次增高，与操作系统有关(如epoll属于Linux操作系统), 我们选择的时候需要注意。

Java本身的多路复用api使用比较复杂，我们一般使用更易用的网络框架Netty。
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210507145828.png)

> 异步IO

异步IO由操作系统完成数据等待和读取过程，完成之后通过回调告诉应用程序，理论上性能最好。
Java使用 AIO(也称Nio2.0)进行支持。 

但操作系统对异步IO模型支持的并不完善(如Linux就不支持), 因此并不常用。

## 阶段4: 业务逻辑处理

历经万难，终于到了我们的业务逻辑处理阶段，也是程序员的主战场，优化方向大家也非常熟悉，在此简单提一下。

逻辑类请求
1. 优化代码逻辑
2. 优化数据库索引、sql
3. 引入缓存
4. 使用多线程处理业务逻辑

> 在多路复用模型下，IO线程会非常快，如果业务逻辑处理速度较慢，则一定要使用单独的线程池。 如netty可以指定线程池执行handler业务


文件类请求

文件读取和发送涉及多次系统调用(引起上下文切换)和数据复制，因此优化方向就是减少系统调用和数据复制的次数，从而出现了零拷贝技术。

下面用几张图来说明几种不同技术的处理流程：

> read + write

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210513171203.png)

> 零拷贝之 mmap + write

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210513171304.png)

> 零拷贝之 sendfile 初级

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210513171419.png)

> 零拷贝之 sendfile 高级

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20210513171434.png)

## 阶段5: socket等待数据可写+写阶段

本阶段与阶段3的等待读+读阶段的情况完全相似，就不再重复讨论了。

# 总结

网络编程的性能优化其实就是针对网络处理过程各个阶段进行分析优化。

1. 增大半、全连接队列，提升客户端并发接入的速度

2. accept()线程与子socket的IO线程分离，提升客户端并发接入速度

3. 多路复用使用极少的线程监控成千上万个socket的IO操作，极大的提升了服务可处理的客户端数量；以事件为驱动，极大减少了整体的IO等待时间

4. 多路复用中的IO线程会同时处理很多socket的读写请求，一定要避免阻塞以免影响其它连接(耗时业务使用单独的线程池处理)

5. 使用零拷贝技术，减少系统调用和数据复制次数

其中2、3就是我们常说的Reactor模型。 Reactor模型中的单Reactor单线程模型、单Reactor多线程模型、主从Reactor多线程模型优化思路和我们上面列的原则是一致的。

## 参考 
公众号：小林coding















