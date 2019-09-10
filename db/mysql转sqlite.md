# mysql 转 sqlite
> 机缘巧合遇到这个需求，记录一下转换过程

## 脚本自动转换
> 找到了一个自动转换的脚本，可直接把将sql文件转成sqlite.db

[https://github.com/dumblob/mysql2sqlite](https://github.com/dumblob/mysql2sqlite)

## 大小写敏感问题

sqlite默认对大小写敏感，如果查询忽略大小写，需特殊处理建表sql

  * 建表时指明忽略：通过工具将 sqlite.db 导出sql，修改建表脚本
  * 查询时指明：修改查询代码sql

参考 [https://blog.csdn.net/u010801696/article/details/83244432](https://blog.csdn.net/u010801696/article/details/83244432)

## jdbc url
```
# Windows
Connection connection = DriverManager.getConnection("jdbc:sqlite:C:/work/mydatabase.db");

# Linux、Mac OS X
Connection connection = DriverManager.getConnection("jdbc:sqlite:/home/leo/work/mydatabase.db");

```