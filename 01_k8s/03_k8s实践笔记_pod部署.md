# 03_k8s实践_pod部署

## nginx pod dome

1. 创建配置文件：nginx-deployment.yaml
```
vim nginx-deployment.yaml
```

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 2
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.7.9
        ports:
        - containerPort: 80
```
2. 加载配置文件

```
[root@CentOS-1 k8s]# kubectl apply -f nginx-deployment.yaml
deployment.apps/nginx-deployment created
```

3. 查看 pod 状态
```
[root@CentOS-1 k8s]# kubectl get pods
NAME                                READY   STATUS    RESTARTS   AGE
nginx-deployment-54f57cf6bf-rkfq5   1/1     Running   0          8s
nginx-deployment-54f57cf6bf-z4lkl   1/1     Running   0          8s
```

4. 查看 pod 详细信息
```
kubectl describe pod nginx-deployment-54f57cf6bf-z4lkl

...
IP:           10.32.0.6
...
Port:           80/TCP
...

```
5. 访问验证
```
curl http://10.32.0.6
```

> 用户需要操作只有编辑 yaml配置文件并加载，仅此而已，两个nginx pod就部署成功了。


## 升级 nginx pod

1. 编辑 nginx-deployment.yaml
> 将nginx升级到1.8， 将副本数改为 3个 

```
vim nginx-deployment.yaml
```

```
...
spec:
  ...
  replicas: 3 # 副本由 2 改为 3
  template:
    ...
    spec:
      containers:
      - name: nginx
        image: nginx:1.8 # 1.7.9 改为 1.8
        ports:
        - containerPort: 80
```

2. 再次加载配置文件
```
[root@CentOS-1 k8s]# kubectl apply -f  nginx-deployment.yaml
deployment.apps/nginx-deployment configured
```
```
[root@CentOS-1 k8s]# kubectl get pods
NAME                                READY   STATUS              RESTARTS   AGE
nginx-deployment-54f57cf6bf-hh8vx   1/1     Running             0          57s
nginx-deployment-54f57cf6bf-rkfq5   1/1     Running             0          28m
nginx-deployment-54f57cf6bf-z4lkl   1/1     Running             0          28m
nginx-deployment-9f46bb5-nbj58      0/1     ContainerCreating   0          57s


[root@CentOS-1 k8s]# kubectl get pods
NAME                                READY   STATUS        RESTARTS   AGE
nginx-deployment-54f57cf6bf-rkfq5   0/1     Terminating   0          28m
nginx-deployment-54f57cf6bf-z4lkl   1/1     Terminating   0          28m
nginx-deployment-9f46bb5-fckb8      1/1     Running       0          2s
nginx-deployment-9f46bb5-nbj58      1/1     Running       0          69s
nginx-deployment-9f46bb5-wtswt      1/1     Running       0          3s


[root@CentOS-1 k8s]# kubectl get pods
NAME                             READY   STATUS    RESTARTS   AGE
nginx-deployment-9f46bb5-fckb8   1/1     Running   0          10s
nginx-deployment-9f46bb5-nbj58   1/1     Running   0          77s
nginx-deployment-9f46bb5-wtswt   1/1     Running   0          11s
```

> k8s 会自动进行滚动升级， 而开发人员仅需编辑yaml配置文件并重新加载，真的非常方便

## 添加 volume

1. 编辑配置文件
```
vim nginx-deployment.yaml
```

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 3
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.8
        ports:
        - containerPort: 80
        volumeMounts:
        - mountPath: "/usr/share/nginx/html"
          name: nginx-vol
      volumes:
      - name: nginx-vol
        emptyDir: {}
        hostPath:
          path: /var/data
```

2. 再次加载配置文件
```
[root@CentOS-1 k8s]# kubectl apply -f  nginx-deployment.yaml
deployment.apps/nginx-deployment configured
```

3. 查看 pod 详细信息
```
kubectl describe pod nginx-deployment-54d8dff7d7-vmm25

...
Volumes:
  nginx-vol:
    Type:       EmptyDir (a temporary directory that shares a pod's lifetime)
    Medium:
    SizeLimit:  <unset>
  default-token-nvwbb:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-nvwbb
    Optional:    false
...

```

## 进入 pod 内部
```
kubectl exec -it nginx-deployment-54d8dff7d7-vmm25 -- /bin/bash
```

## 删除 pod
```
kubectl delete -f nginx-deployment.yaml
```

## 配置文件说明

一个 YAML 文件，对应到 k8s 中，就是一个 API Object(API 对象)。当对这个对象的各个字段定义好值并提交给 k8s, k8s 就会创建这些对象定义的各项 API 资源。

1. kind: Deployment
> kind 指定 API 对象的类型为 一个 Deployment， 它是一个定义多副本应用(多副本POD)的对象。它还负责在 pod 定义改变时进行滚动升级（Rolling Update）

2. spec.replicas：2
> 定义副本数量

3. spec.template
> 定义 pod 模板，模板描述了需要创建 pod 的细节。如容器个数、容器名称、镜像、监听端口等

4. metadata
> `metadata` 为 api 对象的“标识”，即元数据，也是从 k8s 中查找对象的主要依据。

5. labels
labels 就是一组 key-value 格式的标签,用于过滤对象

6. Label Selector
spec.selector.matchLabels，指定过滤规则

7. volume

emptyDir： 表将 k8s 创建的零时目录作为volume的宿主机目录，类比 docker 的不指定路径的 volume 

hostPath： 指定宿主机路径
```
volumes:
     - name: nginx-vol
       hostPath:
         path: /var/data
```

一个 k8s 的 api 对象的定义，大多可分为 Metadata 和 Spec 两个部分。

前者存放这个对象的元数据，对所有 API 对象来说，这一部分的字段和格式基本上是一样的;

后者存放的则是属于这个对象独有的定义，用来描述它所要表达的功能

