使用Spring 5创建WEB应用
===

> 原文地址: [http://www.baeldung.com/bootstraping-a-web-application-with-spring-and-java-based-configuration](http://www.baeldung.com/bootstraping-a-web-application-with-spring-and-java-based-configuration)

1.综述
---

> 本教程演示了怎么使用Spring创建WEB应用，并讨论了如何从XML文件调整到java 而无需迁移正品XML配置。

2.Maven pom.xml
---

```
<project xmlns=...>
   <modelVersion>4.0.0</modelVersion>
   <groupId>org</groupId>
   <artifactId>rest</artifactId>
   <version>0.1.0-SNAPSHOT</version>
   <packaging>war</packaging>

   <dependencies>

      <dependency>
         <groupId>org.springframework</groupId>
         <artifactId>spring-webmvc</artifactId>
         <version>${spring.version}</version>
         <exclusions>
            <exclusion>
               <artifactId>commons-logging</artifactId>
               <groupId>commons-logging</groupId>
            </exclusion>
         </exclusions>
      </dependency>

   </dependencies>

   <build>
      <finalName>rest</finalName>

      <plugins>
         <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.7.0</version>
            <configuration>
               <source>1.8</source>
               <target>1.8</target>
               <encoding>UTF-8</encoding>
            </configuration>
         </plugin>
      </plugins>
   </build>

   <properties>
      <spring.version>5.0.2.RELEASE</spring.version>
   </properties>

</project>
```

3.基于java配置web应用
---

```
@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "org.baeldung")
public class AppConfig{

}
```

首先,`@Configuration`注解是基于java配置Spring的主要组件，它自身被`@Component`注解注释，
这使被注释类成为了一个标准的bean，并可以被组件扫描。

`@Configuration`最主要的作用就是在源码上将类定义为Spring Ioc容器的bean。有关更详细的说明，请参阅官方文档。

`@EnableWebMvc` 用于配置Spring Web Mvc， 该配置启用了`@Controller`、`@RequestMapping`注解，
它等同于XML中的：
> `<mvc:annotation-driven />`

再转到` @ComponentScan`, 它配置了组件扫描指令，等同于XML中的：
> `<context:component-scan base-package="org.baeldung" />`

Spring 3.1中，`@Configuration`在classpath扫描中被默认排除。在Spring 3.1之前，这些类需要明确指出被排除：
> `excludeFilters = { @ComponentScan.Filter( Configuration.class ) }`

被`@Configuration`注释的类不应该被自动发现，因为它们已经被容器使用-允许它们被发现并将其引入至Spring上下文中将导致一下错误：

```
Caused by: org.springframework.context.annotation.ConflictingBeanDefinitionException: Annotation-specified bean name ‘webConfig’ for bean class [org.rest.spring.AppConfig] conflicts with existing, non-compatible bean definition of same name and class [org.rest.spring.AppConfig]
```

3.1 web.xml
---

```
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns=...>

   <context-param>
      <param-name>contextClass</param-name>
      <param-value>
         org.springframework.web.context.support.AnnotationConfigWebApplicationContext
      </param-value>
   </context-param>
   <context-param>
      <param-name>contextConfigLocation</param-name>
      <param-value>org.baeldung</param-value>
   </context-param>
   <listener>
      <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
   </listener>

   <servlet>
      <servlet-name>rest</servlet-name>
      <servlet-class>
         org.springframework.web.servlet.DispatcherServlet
      </servlet-class>
      <init-param>
         <param-name>contextClass</param-name>
         <param-value>
            org.springframework.web.context.support.AnnotationConfigWebApplicationContext
         </param-value>
      </init-param>
      <init-param>
         <param-name>contextConfigLocation</param-name>
         <param-value>org.baeldung.spring</param-value>
      </init-param>
      <load-on-startup>1</load-on-startup>
   </servlet>
   <servlet-mapping>
      <servlet-name>rest</servlet-name>
      <url-pattern>/api/*</url-pattern>
   </servlet-mapping>

   <welcome-file-list>
      <welcome-file />
   </welcome-file-list>

</web-app>
```