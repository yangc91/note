# enum(枚举)实践

## 目录
## [两个隐式方法](#两个隐式方法)
## [声明及基本用法](#声明及基本用法)
## [与switch配合](#与switch配合)

## 两个隐式方法
> 当生成一个枚举值类型的对象时，它会直接用有两个隐式的静态方法
> * values()
> * valueOf(String name)

```
/**
* Returns an array containing the constants of this enum
* type, in the order they're declared.  This method may be
* used to iterate over the constants as follows:
*
*    for(E c : E.values())
*        System.out.println(c);
*
* @return an array containing the constants of this enum
* type, in the order they're declared
*/
public static E[] values();

/**
* Returns the enum constant of this type with the specified
* name.
* The string must match exactly an identifier used to declare
* an enum constant in this type.  (Extraneous whitespace
* characters are not permitted.)
*
* @return the enum constant with the specified name
* @throws IllegalArgumentException if this enum type has no
* constant with the specified name
*/
public static E valueOf(String name);

```
[参考链接](https://docs.oracle.com/javase/specs/jls/se7/html/jls-8.html#jls-8.9.2)

> 个人觉得这两个方法很重要，使用的场景也很多

## 声明及基本用法
```
  public enum Opt {
    ON(1),
    OFF(2);
    private int value;

    private Opt(int value) {
      this.value = value;
    }

    public static Opt fromValue(int value) {
      if(value == ON.value) {
        return ON;
      } else {
        return OFF;
      }
    }
  }

  // use valueOf(String name) and fromValue(int value)
  public Opt getOpt () {
    int value = 2;
    Opt opt = Opt.fromValue(value);

    // String name = "OFF";
    // opt = Opt.valueOf(name);
    // name must match exactly an identifier used to declare an enum constant in this type
    // or will throw IllegalArgumentException

    // get all Opt's elements
    Opt[] opts = Opt.values();
    for (Opt item : opts) {
      System.out.println(item.value);
    }

    return opt;
  }
```

## 与switch配合
```
  public void withSwitch (int value) {
    Opt opt = Opt.fromValue(value);

    switch (opt) {
      // case Opt.ON: this will prompt 'The qualified case label Snake.Action.LEFT must be replaced with the unqualified enum constant LEFT'
      case ON:
        System.out.println("on");
        break;
      case OFF:
        System.out.println("off");
        break;
    }
  }
```

## 推荐阅读
* [深入理解Java枚举类型(enum)](https://blog.csdn.net/javazejian/article/details/71333103)