如今，大多数java项目都使用了 `maven` 来管理 `jar` 包, 非常方便. 今天来讲一下自定义 `maven` 的 `archetype` 作为项目模板, 可非常方便的搭建新项目。

## create
以现有 `maven` 项目创建模板

```
cd project
mvn archetype:create-from-project
```

> 该命令会会在 `target/generated-sources` 路径下创建一个以现有项目为模板名称为 `archetype` 的 `maven` 项目.

## install
```
cd target/generated-sources/archetype
mvn install
```
> 该命令会将该模板安装到本地仓库

## use

安装到本地仓库后，就可以使用它来创建新项目了。

以 `idea` 为例：


![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20190202215812.png)

创建 `maven` 项目, 选择使用 `archetype`, 添加 `archetype`, 填入之前创建的信息即可。

![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20190202220330.png)

> 创建之后即可在列表中查看到自定义的模板， 选择并进行下一步即可。

## 参考资料

[Guide to Maven Archetype](https://www.baeldung.com/maven-archetype)

[Guide to Creating Archetypes](https://maven.apache.org/guides/mini/guide-creating-archetypes.html)