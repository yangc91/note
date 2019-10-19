# gdrive-谷歌网盘命令行工具安装使用实践
> 网上查询资料时，发现谷歌网盘上有不少好资源。但是因为网络问题，直接下载到本地会很慢。
因此我想利用一下`vps`主机。使用令行工具，先慢慢下载到`vps`上，之后再下载到本地即可。

[gdrive github](https://github.com/gdrive-org/gdrive)

## 下载
在github上下载所需版本,如我下载的为 `gdrive-linux-x64`
```
# 添加可执行权限
chmod +x gdrive-linux-x64
```
## 登录
```
./gdrive-linux-x64 about
```
  * 会先打印一段网址
  * 用浏览器访问后，使用google账号进行授权，会返回 token
  * 将 token 复制到命令行，回车确认
 
## 基本API

### 列表
```
gdrive [global] list [options]
global:
  -c, --config <configDir>         Application path, default: /Users/<user>/.gdrive
  --refresh-token <refreshToken>   Oauth refresh token used to get access token (for advanced users)
  --access-token <accessToken>     Oauth access token, only recommended for short-lived requests because of short lifetime (for advanced users)
  --service-account <accountFile>  Oauth service account filename, used for server to server communication without user interaction (file is relative to config dir)

options:
  -m, --max <maxFiles>       Max files to list, default: 30
  -q, --query <query>        Default query: "trashed = false and 'me' in owners". See https://developers.google.com/drive/search-parameters
  --order <sortOrder>        Sort order. See https://godoc.org/google.golang.org/api/drive/v3#FilesListCall.OrderBy
  --name-width <nameWidth>   Width of name column, default: 40, minimum: 9, use 0 for full width
  --absolute                 Show absolute path to file (will only show path from first parent)
  --no-header                Dont print the header
  --bytes                    Size in bytes
```

eg：
```
# 获取根目录下文件、文件夹，会展示fileId
./gdrive-linux-x64 list 

# list 默认只返回自己的文件，不包含别人共享，可以添加 --query '' 显示全部
./gdrive-linux-x64  list --query ''

# 指定文件夹下的文件列表、控制页size、排序等：（fileId 根据上面的命令获得）
./gdrive-linux-x64  list --query  "'fileId' in parents"  -m 50 --order 'name_natural'
```

## 下载
```
gdrive [global] download [options] <fileId>

global:
  -c, --config <configDir>         Application path, default: /Users/<user>/.gdrive
  --refresh-token <refreshToken>   Oauth refresh token used to get access token (for advanced users)
  --access-token <accessToken>     Oauth access token, only recommended for short-lived requests because of short lifetime (for advanced users)
  --service-account <accountFile>  Oauth service account filename, used for server to server communication without user interaction (file is relative to config dir)
  
options:
  -f, --force           Overwrite existing file
  -r, --recursive       Download directory recursively, documents will be skipped
  --path <path>         Download path
  --delete              Delete remote file when download is successful
  --no-progress         Hide progress
  --stdout              Write file content to stdout
  --timeout <timeout>   Set timeout in seconds, use 0 for no timeout. Timeout is reached when no da
```
eg：
```
# 下载指定文件
./gdrive-linux-x64 download fileId

# 下载指定文件夹
./gdrive-linux-x64 download -r fileId

```

> 目前个人的需求就只用到了批量下载，后续用到其它接口快速查询 api 即可。

## 参考网站
[https://www.dongganboy.com/195.html](https://www.dongganboy.com/195.html)
[https://onebox.site/archives/250.html](https://onebox.site/archives/250.html)
[https://github.com/veip007/Linux-to-Google-Drive](https://github.com/veip007/Linux-to-Google-Drive)
