Http请求实践
===

后台开发时，经常需要进行系统对接，远程接口调用非常普遍，现总结一下针对http接口的远程调用

常用工具：
----

* HttpClient(4.3.3)
* OKHttp(3.10.0)


HttpClient
------

> 构建全局公用的httpclient连接池

```
public class HttpClientPoolUtil {

  private static Integer POOL_MAX_TOTAL = 300;
  private static Integer POOL_DEFAULT_MAX_PERROUTE = 200;

  private static CloseableHttpClient httpclient = null;

  /**
   * 全局公用一个httpclient连接池
   * https暂只支持单向认证
   */
  public static synchronized CloseableHttpClient getHttpClient() {

    if (null == httpclient) {
      // https相关设置, 只支持单向认证
      SSLContext sslcontext = null;
      try {
        sslcontext = SSLContexts.custom()
            .loadTrustMaterial(null, new TrustStrategy() {
              @Override
              public boolean isTrusted(X509Certificate[] chain, String authType) {
                // 允许自签名证书
                return true;
              }
            }).build();
      } catch (Exception e) {
        e.printStackTrace();
      }

      SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(
          sslcontext, SSLConnectionSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER);

      // SSLConnectionSocketFactory.getSystemSocketFactory();
      // 注册访问协议的相关工厂
      Registry<ConnectionSocketFactory> socketFactoryRegistry =
          RegistryBuilder.<ConnectionSocketFactory>create()
              .register("http", PlainConnectionSocketFactory.INSTANCE)
              .register("https", sslsf)
              .build();

      HttpConnectionFactory<HttpRoute, ManagedHttpClientConnection> connFactory =
          new ManagedHttpClientConnectionFactory(
              DefaultHttpRequestWriterFactory.INSTANCE, DefaultHttpResponseParserFactory.INSTANCE);

      DnsResolver dnsResolver = SystemDefaultDnsResolver.INSTANCE;

      // Create a connection manager with custom configuration.
      PoolingHttpClientConnectionManager connManager = new PoolingHttpClientConnectionManager(
          socketFactoryRegistry, connFactory, dnsResolver);

      // Create socket configuration
      SocketConfig socketConfig = SocketConfig.custom()
          .setTcpNoDelay(true)
          .build();

      connManager.setDefaultSocketConfig(socketConfig);
      // 连接池最大连接数
      connManager.setMaxTotal(POOL_MAX_TOTAL);
      // 每个路由默认的最大连接数
      connManager.setDefaultMaxPerRoute(POOL_DEFAULT_MAX_PERROUTE);
      // 对单个域名的路由设置最大连接数
      //connManager.setMaxPerRoute(new HttpRoute(new HttpHost("somehost", 80)), 20)

      // Create global request configuration
      RequestConfig requestConfig = RequestConfig.custom()
          .setConnectTimeout(2000) // 连接上服务器(握手成功)的时间，超出该时间抛出connect timeout
          .setSocketTimeout(5000) // 服务器返回数据(response)的时间
          .setConnectionRequestTimeout(2000) // 从连接池中获取连接的超时时间，超过该时间未拿到可用连接
          .build();

      httpclient = HttpClients.custom()
          .setConnectionManager(connManager)
          .setDefaultRequestConfig(requestConfig)
          .setRetryHandler(new DefaultHttpRequestRetryHandler(0, false))
          .build();

      // JVM 停止或重启时，关闭连接池释放连接
      Runtime.getRuntime().addShutdownHook(new Thread() {
        @Override
        public void run() {
          try {
            httpclient.close();
          } catch (IOException e) {
            e.printStackTrace();
          }
        }
      });
    }
    return httpclient;
  }
}
```

> GET请求

```
HttpGet httpGet = new HttpGet("http://targethost/homepage");
    CloseableHttpResponse response1 = HttpClientPoolUtil.getHttpClient().execute(httpGet);

    int statusCode = response1.getStatusLine().getStatusCode();
    if (statusCode != HttpStatus.SC_OK) {
      EntityUtils.consume(response1.getEntity());
    } else {
      // do something useful with the response body
      String result = EntityUtils.toString(response1.getEntity(), "utf-8");
    }

```

> POST请求

```
HttpPost httpPost = new HttpPost("http://targethost/login");
    List<NameValuePair> nvps = new ArrayList<>();
    nvps.add(new BasicNameValuePair("username", "vip"));
    nvps.add(new BasicNameValuePair("password", "secret"));
    //httpPost.addHeader("", "");

    // json请求
    StringEntity entity = new StringEntity(Json.toJson(nvps), ContentType.APPLICATION_JSON);
    httpPost.setEntity(entity);

    // form请求
    // httpPost.setEntity(new UrlEncodedFormEntity(nvps));

    CloseableHttpResponse response2 = httpclient.execute(httpPost);

    statusCode = response2.getStatusLine().getStatusCode();
    if (statusCode != HttpStatus.SC_OK) {
      EntityUtils.consume(response2.getEntity());
    } else {
      // do something useful with the response body
      String result = EntityUtils.toString(response2.getEntity(), "utf-8");
    }

```

OKHttp
------

>GET请求

```
OkHttpClient client = new OkHttpClient();
Request request = new Request.Builder()
  .url(url)
  .build();

try (Response response = client.newCall(request).execute()) {
  return response.body().string();
}
```

>POST请求

```
OkHttpClient client = new OkHttpClient();
RequestBody body = RequestBody.create(JSON, json);
Request request = new Request.Builder()
    .url(url)
    .post(body)
    .build();
try (Response response = client.newCall(request).execute()) {
  return response.body().string();
}
```



