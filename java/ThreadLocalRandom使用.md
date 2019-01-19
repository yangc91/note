## ThreadLocalRandom使用

【译文】，作者：baeldung, 源链接：[https://www.baeldung.com/java-thread-local-random](https://www.baeldung.com/java-thread-local-random)

### 综述
生成随机数是很常见的任务。 这也是 JAVA 提供 `Random` 的原因。但是它在多线程环境中性能并不高。

简单来说，`Random` 之所以在多线程环境中性能不高的原因是多个线程共享同一个 `Random` 实例并进行争夺。

为了解决这个限制，JAVA 在 JDK 7 中引入了 `ThreadLocalRandom` 类，用于在多线程环境下生产随机数。

### ThreadLocalRandom 强于 Random
`ThreadLocalRandom` 结合了 `Random` 和 `ThreadLocal` 类，并被隔离在当前线程中。因此它通过避免任何对 `Random` 对象的并发访问，从而在多线程环境中实现了更好的性能。

一个线程获取到的随机数不受另一个线程影响，而 `Random` 提供全局的随机数。

另外，不同于 `Random`， `ThreadLocalRandom` 明确的不支持设置随机种子。 它重写了 `Random` 的
`setSeed(long seed) ` 方法并直接抛出了 `UnsupportedOperationException` 异常。

现在让我们来看看几种生产随机 `int、long、double` 的方式。

### 使用 ThreadLocalRandom 生产随机数
根据 Oracle 的文档，我们只需要调用 `ThreadLocalRandom.current() ` 方法，它就会返回当前线程的 `ThreadLocalRandom` 的实例。
然后我们就可以调用这个实例的方法获取随机数

让我们生成一个没有任何限制的 `int` 值
```
int unboundedRandomValue = ThreadLocalRandom.current().nextInt());
```

现在再生成一个有界的 `int`， 即介于两个数之间。

这是一个生成 0 ~ 100 的 `int` 值的例子

```
int boundedRandomValue = ThreadLocalRandom.current().nextInt(0, 100);
```

请注意：0 是包含在界限内， 而 100 是不在范围内的。

我们可以使用与示例中相似的方式，调用 `nextLong()` 和 `nextDouble()` 方法来生产 `long` 和 `double` 值。

JAVA 8 还添加了一个 `nextGaussian()` 方法来生成正态分布的值，与生成器序列生成的值偏差 0.0 ~ 1.0 。

和 `Random` 类一样，我们可以使用 `doubles(), ints(), longs()`方法来生成随机数流。

### 使用 JMH 比较

让我们来看看怎样在多线程环境下使用这两个类来获取随机数，并使用 JMH 比较性能。

首先， 让我们创建一个多个线程共享一个 `Random` 实例的例子。
我们提交使用 `Random` 实例生成随机数的任务至 `ExecutorService` 中：
```
ExecutorService executor = Executors.newWorkStealingPool();
List<Callable<Integer>> callables = new ArrayList<>();
Random random = new Random();
for (int i = 0; i < 1000; i++) {
    callables.add(() -> {
         return random.nextInt();
    });
}
executor.invokeAll(callables);
```

接下来使用 `JMH benchmarking` 来检测上述代码的性能：
```
# Run complete. Total time: 00:00:36
Benchmark                                            Mode Cnt Score    Error    Units
ThreadLocalRandomBenchMarker.randomValuesUsingRandom avgt 20  771.613 ± 222.220 us/op
```

相似的，现在让我们使用 `ThreadLocalRandom` 代替 `Random`
```
ExecutorService executor = Executors.newWorkStealingPool();
List<Callable<Integer>> callables = new ArrayList<>();
for (int i = 0; i < 1000; i++) {
    callables.add(() -> {
        return ThreadLocalRandom.current().nextInt();
    });
}
executor.invokeAll(callables);
```

下面是 `ThreadLocalRandom` 的测试结果：
```
# Run complete. Total time: 00:00:36
Benchmark                                                       Mode Cnt Score    Error   Units
ThreadLocalRandomBenchMarker.randomValuesUsingThreadLocalRandom avgt 20  624.911 ± 113.268 us/op
```

最后比较上面的测试结果， 我们可以清晰的看到生成 1000 个随机数，`Random` 耗时 772 毫秒， 而 `ThreadLocalRandom` 耗时 625 毫秒。

因此，我们可以得出 `ThreadLocalRandom` 在高并发环境下更有效率

为了学习 JMH， 可以参考之前的[文章](https://www.baeldung.com/java-microbenchmark-harness)

### 结论
本文讲述了 `Random` 和 `ThreadLocalRandom` 之间的区别。

我们也看到了在 `ThreadLocalRandom` 比 `ThreadLocalRandom` 在多线程环境下的优势和性能，以及如何使用等。

`ThreadLocalRandom` 是 JDK 的一个简单补充，但是能在高并发应用中产生显著的影响。

然后，跟往常一样，所有的示例都可以在 [GitHub project](https://github.com/eugenp/tutorials/tree/master/core-java-concurrency-advanced) 中看到。



 