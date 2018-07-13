java-final笔记
===

[java编程思想](#)学习笔记

* 编译器常量：可以在编译时执行计算式，必须 是基本数据类型、携带final关键字、使用之前必须被初始化
* 对象引用：final使引用恒定不变，一旦引用被初始化指向一个对象，则无法再指向另一个对象，对象本身属性可变

空白final
---

java允许生成“空白final”，即声明为final但又为给定初值，这种情况必须在类的构造方法中初始化

```
public class FinalLearn {
  // 定义时赋值
  private final int i = 1;

  // 声明 空白final属性
  private final int n;

  public FinalLearn() {
    // 空白final属性必须在构造方法中赋值
    n = 3;
  }

  public FinalLearn(int m) {
    // 多个构造方法时，都需给空白final属性赋值
    n = m;
  }
}
```

final参数
---

当参数列表中的参数被final修饰后，在方法内无法修改参数所引用的对象

```
  public void withFinal(final Integer i) {
    // error
    // i = new Integer(1);
  }

  public void withoutFinal(Integer i) {
    // ok
    i = new Integer(1);
  }
```

final方法
---

方法锁定，禁止继承类重写方法

final类
---

不允许被其它类继承

> 由于final类不允许被继承，所以其所有方法都隐士指定为final，因为无法覆盖，也可以显示添加final修饰词，但不会添加任何意义

