SpringMvc防御XSS实践
===

项目在漏洞扫描时发现xss漏洞， 本以为是常见漏洞，网上有很多解决方案，应该能很快搞定，但实际上文章看了不少，却并未找到十分“顺手”的解决方案。
历经波折终于完成了一套自己想要的方案，现将过程分享出来，希望能帮助到遇到同样的问题人。

方案目标：
----

* 只配置一次，与业务接口无关
* 过滤两种请求的参数：Content-Type为form表单(application/x-www-form-urlencoded)和 json(application/json)


application/json
------

对于json请求，spring mvc默认使用MappingJackson2HttpMessageConverter转换器，
而它是使用jackson来序列化对象的，如果我们能 将jackson的序列化和反序列化过程修改，加入过滤xss代码，并将其注册到MappingJackson2HttpMessageConverter中，那么就能解决json请求的xss问题，而且我相信jackson肯定有这种接口。

### 具体实现：

#### StdSerializer<T>

> 自定义序列化类

```
/**
 *  序列化
 * @date: 2017-12-15.
 */
public class DefaultJsonSerializer extends StdSerializer<String> {

  public DefaultJsonSerializer() {
    this(null);
  }

  public DefaultJsonSerializer(Class<String> t) {
    super(t);
  }

  @Override
  public void serialize(String value, JsonGenerator gen, SerializerProvider serializers)
      throws IOException {
    // xss策略在此执行
    String safe = HtmlUtils.htmlEscape(value, "utf-8");
    gen.writeString(safe);
  }
}
```

#### StdDeserializer<T>

> 自定义反序列化类

```
/**
 *  反序列化
 * @date: 2017-12-15.
 */
public class DefaultJsonDeserializer extends StdDeserializer<String> {

  public DefaultJsonDeserializer() {
    this(null);
  }

  public DefaultJsonDeserializer(Class<String> t) {
    super(t);
  }

  @Override
  public String deserialize(JsonParser p, DeserializationContext ctxt)
      throws IOException {
    String value = p.getValueAsString();
    if (StringUtils.isEmpty(value)) {
      return value;
    } else {
      value = HtmlUtils.htmlEscape(value.toString(), "utf-8");
      return value;
    }
  }
}
```

#### 配置HttpMessageConverter<T>

> java config配置
```
// WebMvcConfigurerAdapter子类中添加如下代码：
@Override
public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
  SimpleModule module = new SimpleModule();
  module.addDeserializer(String.class, new DefaultJsonDeserializer());
  module.addSerializer(String.class, new DefaultJsonSerializer());
  ObjectMapper mapper = Jackson2ObjectMapperBuilder.json().build();
  //注册自定义的序列化和反序列化器
  mapper.registerModule(module);
  MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter(mapper);
  converters.add(converter);
}

// configureMessageConverters会覆盖spring默认的转换器，如果想额外添加一个自定义的转换器
重写extendMessageConverters方法
@Override
public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
  //...额外添加转换器....
}
```

> xml配置

```
<mvc:annotation-driven>
<mvc:message-converters register-defaults="true">
<bean  ref="jsonConverter"/>
</mvc:message-converters>
</mvc:annotation-driven>
<!--
 配置MappingJackson2HttpMessageConverter
记得给它注入添加了DefaultJsonDeserializer、DefaultJsonSerializer的ObjectMapper
-->
```

application/x-www-form-urlencoded
------

#### 使用@InitBinder，控制器中添加如下代码

```
@InitBinder
public void initBinder(WebDataBinder binder) {
    // 注意CustomStringEditor为非线程安全类，故这里需构建对象，不能直接
    // 注入bean
    binder.registerCustomEditor(Date.class, new CustomStringEditor());
}
```
#### 自定义类型转换器 继承PropertyEditorSupport

```
public class CustomStringEditor extends PropertyEditorSupport {

  @Override
  public void setAsText(String text) throws IllegalArgumentException {
    if (text == null || text.equals("")) {
      text = "";
    }
    // xss过滤，表单提交时封装参数，String类型会经过此处
    text = HtmlUtils.htmlEscape(text, "utf-8");
    setValue(text);
  }

  @Override
  public String getAsText() {
    return getValue().toString();
  }
}
```

接下来，启动测试即可。

目前代码已经存放到github上，欢迎star 和 fork，指出问题，一起学习交流

github地址：[SpringMvc防御XSS实践](https://github.com/yangc91/note/blob/master/java/SpringMvc防御XSS实践.md)

源码地址：[spring mvc xss防御](https://github.com/yangc91/springxss)