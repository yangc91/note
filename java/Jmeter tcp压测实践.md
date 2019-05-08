> 项目需要针对socket协议接口进行性能测试。选定了比较熟悉的 Jmeter 工具，现记录下过程。

## 新建 Tcp Sampler
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20190507232039.png)

Jmeter 提供了3个Tcp实现类：

  * TCPClientImpl。这是实现文本消息交换的基本类。在TCP取样器中，Text to send字段提供不同字符集的文本常量或可变字符串信息。
  * BinaryTCPClientImpl。这是一个用于实现文本信息交互的类。Text to send字段中提供十六进制编码的二进制文本常量或变量信息。
  * LengthPrefixedBinaryTCPClientImpl。这个类跟上一个的类似，但是在发送数据之前会加一个二进制的字节长度数据前辍。
 
个人选择了 BinaryTCPClientImpl， 因为项目使用的协议报文是二进制，不是字符串，而且二进制转十六进制也很容易，后续都以此为例进行测试。


## 配置 TCP Sampler

``` bash
vim  /{jmeter}/bin/jmeter.properties

# 启用 BinaryTCPClientImpl 
tcp.handler=BinaryTCPClientImpl
```

> 重启Jmeter 即可发送16进制参数进行请求。

## 连接一直阻塞

运行测试任务发现： 后台正常收到请求、处理并返回数据，但客户端 socket 连接一直被阻塞，无法进行后续请求及统计性能。

> 搜索知是因为未配置 「结束符」 所致，只有当客户端在取响应流中读到 「结束符」 才会认为本次业务完成，否则会一直阻塞，直到流被关闭。


Jmeter 配置文件中关于结束符的描述：
```
# eolByte = byte value for end of line
# set this to a value outside the range -128 to +127 to skip eol checking
#tcp.eolByte=1000
```
BinaryTCPClient 源码：
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20190507234421.png)

> 注意 BinaryTCPClient 的「结束符」配置是： `tcp.BinaryTCPClient.eomByte`， 与配置文件列的不一样。

```bash
vim /{jmeter}/bin/jmeter.properties

# 添加结束符
tcp.BinaryTCPClient.eomByte=-128
```
> 注意这个配置是10进制的数，需要根据响应报文转化得到。

再看源码对 「结束符」的判断：
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20190507235036.png)

   * useEolByte  只有在值为 -128 ~ +127 之间时才为 true。
 
   * 对于结束符的判断，只在流的结尾处判断最后一个字节是否与为 配置的值。如果是就结束，不是就继续循环。
 
  * 如果自己的业务响应报文结尾不符合 -128 ~ +127 这个范围，那么只能在正常报文尾部再添加一个 符合的字节，我们项目就是这种情况。

## 一个业务需单socket多次收发数据

我们的一个业务需在 一个socket 建立后，与后台进行3次有依赖顺序的通信才算完成。

方法：使用 Re-use connection 和 close connection 组合。

  * Re-use connection： 表示在一个线程循环内的 tcp sampler 是否可重用同一个socket连接，即共用一个socket。

  * close connection： 表示完成本次请求后是否关闭socket，如果关闭，则下一个 tcp sampler 会重新创建 socket

新建多个 tcp sampler：

  * 每个都勾选Re-use connection， 表示大家都可以共用一个socket

  * 只有最后一个tcp sampler 勾选 close connection，这样上面的 socket 会延续下来继续使用，完成最后交互后，关闭socket，进行下一轮循环业务时，又会创建新的socket


## 获取完整业务的统计数据

使用 jmeter 事物

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20190508001102.png)

将上一步中创建的所有 tcp sampler 全放到同一个事物中，统计时就能获取到该事物（即该业务）的统计数据。

## 感悟

踩了不少坑，发现还是源码大法好。直接看关键业务代码。 了解了其实现逻辑，一些看似疑难杂症的问题也就随之而解了。