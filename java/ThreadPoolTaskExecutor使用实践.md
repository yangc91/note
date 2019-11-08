ThreadPoolTaskExecutor使用实践
===

后台开发中，经常有一些非主流程业务要处理，为了提升主业务处理速度，可使用`ThreadPoolTaskExecutor`线程池来异步处理

配置
----

> java config

```
  @Bean
  public ThreadPoolTaskExecutor taskExecutor() {
    ThreadPoolTaskExecutor poolExecutor = new ThreadPoolTaskExecutor();
    // 核心线程数
    poolExecutor.setCorePoolSize(5);
    // 最大线程数
    poolExecutor.setMaxPoolSize(15);
    // 队列大小
    poolExecutor.setQueueCapacity(100);
    // 线程最大空闲时间
    poolExecutor.setKeepAliveSeconds(300);
    // 拒绝策略
    poolExecutor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
    // 线程名称前缀
    poolExecutor.setThreadNamePrefix("my-pool-");

    return poolExecutor;
  }
```

> xml config

```
  <bean id="taskExecutor" class="org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor">
    <property name="corePoolSize" value="8"/> <!--核心线程数 -->
    <property name="maxPoolSize" value="16"/> <!--最大线程数 -->
    <property name="keepAliveSeconds" value ="3000"/> <!--线程最大空闲时间 -->
    <property name="queueCapacity" value="200"/> <!-- 队列大小 -->
    <property name="threadNamePrefix" value="my-pool-"/>
    <property name="rejectedExecutionHandler">
      <bean class="java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy"/>
    </property>
  </bean>
```

任务处理流程及参数
---

> 新任务提交时：若当前线运行的程数量小于核心线程数，则创建一条新线程;
  若已经超过核心线程数，则先放入队列中； 队列满后，创建新线程;
  当线程总数等于最大线程数时，则执行拒绝策略

> `ThreadPoolTaskExecutor`是`InitializingBean`、`DisposableBean`的实现类，
   spring容器后会自动处理其初始化方法和注销方法，我们只需配置bean即可

> java提供的拒绝策略
* AbortPolicy，直接抛出RejectedExecutionException
* CallerRunsPolicy，直接在主线程中执行
* DiscardOldestPolicy 抛弃队列头的任务，然后重试execute。
* DiscardPolicy，直接丢弃

使用
---

```
  @Autowired
  private ThreadPoolTaskExecutor taskExecutor;

  public void testExecutor(final String str) {
    taskExecutor.execute(new Runnable() {
      @Override
      public void run() {
        System.out.println(Thread.currentThread().getName() + "--" + str);
      }
    });
  }
```

参考资料
---
[ThreadPoolTaskExecutor使用详解](https://blog.csdn.net/foreverling/article/details/78073105)

> 新发现了一篇线程池的深度好文，特此补充。

[一次Java线程池误用引发的血案和总结](https://zhuanlan.zhihu.com/p/32867181)