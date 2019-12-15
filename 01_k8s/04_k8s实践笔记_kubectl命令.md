# 04_k8s实践_kubectl命令

## kubectl cluster-info
> 查看集群信息
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20191213141734.png)

## kubectl get 
>  列出各种 k8s 对象，只显示基本信息
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20191213142126.png)

`kubectl get pods -o wide` 显示 ip 和 节点

## kubectl describe
> 查看 k8s 对象详细信息
![](https://yangc91.oss-cn-hongkong.aliyuncs.com/imgs/20191213142420.png)

## 设置别名 & 自动补全

别名
```
vim ~/.bashrc

...
alias k=kubectl
...

source ~/.bashrc
```

自动补全
```
yum install -y bash-completion
source <(kubectl completion bash)
echo "source <(kubectl completion bash)" >> ~/.bashrc

# 给别名 k 添加补全
source <(kubectl completion bash | sed s/kubectl/k/g)
source ~/.bashrc
```
 