## wordpress安装实践

### 服务器环境
* centos 7
* [wordperss 4.9.4](https://cn.wordpress.org/txt-download/)
* PHP 5.4.16（系统自带）
* Mysql 5.5
* nginx-1.13.10

> 说明本人为java开发人员，对php一无所知，才导致后面遇到的问题，此篇就是记录排坑过程
> 如果读者为PHP开发或之前启动过nginx+php+mysql项目，可忽略此篇文章，[著名的5分安装](https://codex.wordpress.org/zh-cn:%E5%AE%89%E8%A3%85_WordPress#.E8.91.97.E5.90.8D.E7.9A.845.E5.88.86.E5.AE.89.E8.A3.85)足以完成安装。

* 下载、解压wordpress安装包
* 配置nginx并启动
  ```
  vi nginx.conf
  #配置nginx根目录为wordpress目录
  root /home/wordpress;
  index  index.php index.html index.htm;
  ```
* 启动nginx，打开readme.html，参考该文档配置wp-config文件

* 配置完wp-config，在浏览器中访问wp-admin/install.php
> 前面的步骤很容易完成，但这一步却无法执行，并未进入到安装界面，而是直接下载文件
> 尝试多次都是如此，google后发现，nginx访问php页面时需要将其传递给php解释器，没有配置就会当成普通文件直接下载

* nginx+php+mysql整合
> 参考[how-to-install-linux-nginx-mysql-php-lemp-stack-on-centos-7](https://www.digitalocean.com/community/tutorials/how-to-install-linux-nginx-mysql-php-lemp-stack-on-centos-7)
```bash
#安装组件
yum install php-mysql php-fpm

#配置php
vi /etc/php.ini
#修改配置
cgi.fix_pathinfo=0

#配置php-fpm
vim /etc/php-fpm.d/www.conf
listen = /var/run/php-fpm/php-fpm.sock
# 可使用默认的127.0.0.1:9000，nginx上配置一样即可

# 启动
systemctl start php-fpm
#开机自启
systemctl enable php-fpm

#再次配置nginx
vim nginx.conf

location / {
 try_files $uri $uri/ /index.php?$args;
}

location ~ \.php$ {
  fastcgi_split_path_info  ^(.+\.php)(/.+)$;
  fastcgi_index     index.php;
  #fastcgi_pass与php-fpm配置保持一致
  #fastcgi_pass     unix:/var/run/php/php7.1-fpm.sock;
  fastcgi_pass      127.0.0.1:9000;
  include           fastcgi_params;
  fastcgi_param   PATH_INFO       $fastcgi_path_info;
  fastcgi_param   SCRIPT_FILENAME $document_root$fastcgi_script_name;
}

systemctl restart nginx
```
* 再次打开readme.html,再次访问wp-admin/install.php，即可完成安装

