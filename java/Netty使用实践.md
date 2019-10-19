## Server

``` java
public void server(int nettyPort) {

    /**
     * boss事件循环组， 接收客户端的连接请求
     */
    EventLoopGroup boss = new NioEventLoopGroup();

    /**
     * worker事件循环组，处理已经成功建立的连接
     */
    EventLoopGroup worker = new NioEventLoopGroup();

    /**
     * 业务线程池
     */
    EventExecutorGroup executors = new DefaultEventExecutorGroup(16);

    ServerBootstrap bootstrap = new ServerBootstrap()
        // 绑定 boss、worker组
        .group(boss, worker)
        .channel(NioServerSocketChannel.class)
        //长连接
        .childOption(ChannelOption.SO_KEEPALIVE, true)
        .childHandler(new ChannelInitializer<SocketChannel>() {
          @Override
          protected void initChannel(SocketChannel ch) throws Exception {
            // channel管道，在管道中添加各种handler
            ChannelPipeline pipeline = ch.pipeline();
            // 添加编码、解码器
            pipeline.addLast(new StringDecoder(), new StringEncoder());
            // 添加业务handler，并将其绑定到业务线程池
            pipeline.addLast(executors, new SimpleChannelInboundHandler() {
              @Override
              protected void channelRead0(ChannelHandlerContext ctx, Object msg)
                  throws Exception {
                System.out.println(" client say : " + msg);
                ctx.writeAndFlush("hello, this is server !!!");
              }

              @Override
              public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause)
                  throws Exception {
                System.out.println(" An exception happen");
                cause.printStackTrace();
                ctx.close();
              }
            });
          }
        });

    ChannelFuture future = null;
    try {
      // 绑定端口
      future = bootstrap.bind(nettyPort).sync();
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

    if (future.isSuccess()) {
      System.out.println("Server 启动成功 ");
    }
  }
```
## Client
```
public void client(String ip, int nettyPort) {
    EventLoopGroup group = new NioEventLoopGroup();
    Bootstrap bootstrap = new Bootstrap();
    bootstrap.group(group)
        .channel(NioSocketChannel.class)
        .handler(new ChannelInitializer<SocketChannel>() {
          @Override
          protected void initChannel(SocketChannel ch) throws Exception {
            // channel管道，在管道中添加各种handler
            ChannelPipeline pipeline = ch.pipeline();
            // 添加编码、解码器
            pipeline.addLast(new StringDecoder(), new StringEncoder());
            pipeline.addLast(new SimpleChannelInboundHandler() {
              @Override
              protected void channelRead0(ChannelHandlerContext ctx, Object msg)
                  throws Exception {
                System.out.println(" Server say:  " + msg);
              }

              @Override
              public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause)
                  throws Exception {
                System.out.println(" An exception happen");
                cause.printStackTrace();
                ctx.close();
              }
            });
          }
        });

    try {
      ChannelFuture future = bootstrap.connect(ip, nettyPort).sync();
      new Thread(new Runnable() {
        @Override
        public void run() {
          Channel channel = (SocketChannel) future.channel();
          ByteBuf buffer = Unpooled.copiedBuffer("hello, this is client !!!".getBytes());
          channel.writeAndFlush(buffer);
        }
      }).start();
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }
```

## 服务端性能优化

### 耗时业务另起线程池 `DefaultEventExecutorGroup`

> netty中的channel所有事件始终绑定到woker组中的一个单线程的EventLoop中， 且多个chanel可共享同一个EventLoop，因此该线程不可执行耗时或导致线程阻塞的代码，只适合做编解码相关的简单业务，查询数据库等耗时业务需使用其它线程池异步处理

### 使用 directBuffer 及缓冲池

```
ByteBuf dataByteBuf = PooledByteBufAllocator.DEFAULT.buffer();
```
> 使用 directBuffer 可减少数据拷贝次数（无需从用户空间拷贝到内核空间）提升性能，进行池化后，性能更佳。需注意的是 directBuffer对象 不在JVM 堆中，GC 无法管理，需手动 release ByteBuf 对象

### 使用派生对象
```
ByteBuf.slice();
ByteBuf.readSlice();

```
> 派生对象与源共享一份数据，避免内存复制，创建成本低，可灵活使用以满足业务逻辑。

### 使用 ctx 发送数据
> 使用 ctx.writeAndFlush(), 会将数据传递给channel管道中的下一个 handler， 如果使用 channel.writeAndFlush()，数据会从管道尾部重新开始，流经所有 handler。


## 采坑

### 字节顺序
字节顺序有大端、小端之分，顺序刚好相反。

在与客户端对接时，需要提前进行约定并保持一致

netty 提供了如下接口，方便读、写
```
// read
byteBuf.readInt();
byteBuf.readIntLE();

// write
byteBuf.writeInt();
byteBuf.writeIntLE();

// 同理： 有 Long/Double/Float/Short 等
```

### 内存溢出

中间业务创建的 ByteBuf, 需手动进行release。
```
ByteBuf.release();
ReferenceCountUtil.release();
```

慎用 `ByteBuf.readBytes`, 因为它会创建一个新的ByteBuf, 需手动进行release，可使用 `readSlice` 代替。
