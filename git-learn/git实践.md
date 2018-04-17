# git常用命令

```
git branch -r 查看所有分支
git checkout -b localName origin/master  拉取远程分支
git checkout localName   本地分支切换
git branch -d|-rd maste|roigin/master  删除分支


git tag   查看所有分支
git tag v0.1.2 打分支
git tag -a v0.1.2 -m 'my version'

git show v1.4

git push origin v1.5
git push origin --tags
git push origin --delete tag v1.0.6.5
git tag -d 标签名

```

## git工作流

[参考资料](https://github.com/fengjiachun/my-git/blob/master/git-workflow-tutorial.md)

## 集中工作流（类svn）

>提交至中央库之前，需先fetch到本地，  rebase自己提交到中央库提交历史智商， 即要把自己的修改加到别人已经完成的修改上；
>如有冲突，git会暂停rebase；
>解决冲突： git status 和 git add命令

```
#创建仓库
ssh use@host
git init --bare /path/to/repo.git  // 创建裸仓库

#开发者A
git clone ssh://user@host/path/to/repo.git
git status # 查看本地仓库修改状态
git add # 暂存文件
git commit # 提交文件

#清空暂存区
git reset HEAD --

git push origin master #推到远程
# origin 是克隆仓库时git创建的远程中央仓库别名

#开发者B
git pull --rebase origin masetr

# --rebase 选项告诉git将B的提交移动到同步了中央仓库修改后的master分支的顶部

git push origin master #推到远程
# origin 是克隆仓库时git创建的远程中央仓库别名

git status

git add <some-file>
git rebase --continue
# 一个提交一个提交的合并

git rebase --abort  #恢复至git pull --rebase之前

git push origin master

```

## 功能分支工作流
>以集中工作流为基础， 为不同的新功能分配一个专门的分支开发

```bash
# 开发A开始开发前， 创建一个新的分支
git checkout -b marys-feature master
# 以master为基础，检出一个名为marys-feature的分支，  -b 如分支不存在，则创建

git status
git add <some-file>
git commit

git push -u origin marys-feature
#将marys-feature分支push到中央仓库origin上， -u 设置本地分支去跟踪远程对应的分支， 设置完成后，可直接用git push

git push

#在git gui客户端中发起 pull request， 请求合并marys-feature到master， 团队人员自动收到通知

#团队确认后

git checkout master
git pull
git pull origin marys-feature
git push
```

## gitflow

>功能开发、发布准备和维护分配独立的分支，让发布迭代过程更流畅
