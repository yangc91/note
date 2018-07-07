JAVA注解学习笔记
===

## 学习书籍
* [JAVA编程思想(第四版)第20章](#)

> java SE5中引入的新特性之一，并在`java.lang`中内置了几种注解：
* @Override 表示重写父类方法
* @Deprecated 表示方法过期
* @SuppressWarnings 关闭不当的编译器警号信息

基本语法
---

### 定义注解

```
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Hi {
  int id();
}
```

> 注解的定义与java接口的定义很像，最终也会编译成class文件

### 元注解

1. @Target
> 表示注解可以使用的地方。可能的`ElementType`参数包括:
* CONSTRUCTOR: 构造器声明
* FIELD：属性声明
* LOCAL_VARIABLE：局部变量声明
* METHOD: 方法声明
* PARAMETER：参数声明
* PACKAGE：包声明
* TYPE：类、接口或enum声明
* ANNOTATION_TYPE: 注解声明

2. @Retention
> 表示在什么级别保存该注解信息。可选的`RetentionPolicy`参数包括：
* SOURCE: 源码级别，将被编译器丢弃
* CLASS: 注解在class文件中可用，但会被VM丢弃，此为默认级别
* RUNTIME: VM运行期也保留，因此可通过反射机制读取注解的信息

3. @Documented
> 将此注解包含在Javadoc中

4. @Inherited
> 允许子类继承父类中的注解


### 编写注解处理器

```
# 使用注解
public class HiEntity {
  @Hi(id=22)
  public void tetst() {

  }
}
```

```
# 注解处理器
public class HiChecker {
  public static void checker(Class<?> cl) {
    for (Method m: cl.getDeclaredMethods()) {
      Hi hi = m.getAnnotation(Hi.class);
      if (hi != null) {
        System.out.println(hi.id());
      }
    }

  }
  public static void main(String[] args) {
    checker(HiEntity.class);
  }
```

###注解元素

> 注解元素（属性）可用的类型如下:
* 所有基本类型（int、float、boolean等）
* String
* Class
* enum
* Annotation
* 以上类型的数组

> 如果使用其它类，编译会报错，也不能使用包装类型

###默认值
> 注解的元素必须要具有值，要么元素必须有默认值，要么使用注解时必须指定值
> 非基本类型的元素，不可指定为null值，可自定义一些特殊的值，如空字符串或负数
> 属性名为`value`时，使用注解指定`value`值时可省略，如`@XX('aa')`等价`@XX(value='aa')`,指定多个属性时，都不能省略变量名
