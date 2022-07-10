fake-clipboard 用于在无图形界面的 `linux server` 中运行

## 使用

```bash
mcp --fake-clipboard <filepath>
```

* `fake` 选项用于指定临时文件位置，这个文件将作为伪剪切板（内容交互区）

## 栗子

* 重命名 `mcp` （用于下叙步骤，如果选择其它名字，参考下面的步骤中也需跟着更改）
  ```bash
  cd /home/demo/.yarn/bin
  mv mcp mcp_real
  ```

* 创建脚本 `/usr/bin/mcp`，内容为（需要安装 `@guanghechen/tool-mini-copy@3.1.4^`

  ```bash
  #! /usr/bin/env bash

  USAGE='usage: remote-mcp [--(copy|paste)] [remote-hostname]'

  mode='--copy'
  remote_host='remote-host'
  REMOTE_MCP_PATH='/usr/bin/mcp'
  LOCAL_MCP_PATH='mcp'  # 如果你没有在本地机器上安装 `@guanghechen/tool-mini-copy`，需要改变这个值，可以使用本地系统剪切板的命令位置来代替

  if [[ "$#" -eq 1 ]]; then
    if [[ $1 =~ ^--(.*) ]]; then
      mode=$1
    else
      remote_host=$1
    fi
  elif [[ "$#" -eq 2 ]]; then
    mode=$1
    remote_host=$2
  elif [[ "$#" -ge 3 ]]; then
    echo ${USAGE}
    exit 0
  fi

  case ${mode} in
    ("--copy"*)
      ssh ${remote_host} "$REMOTE_MCP_PATH --force" | LOCAL_MCP_PATH
      ;;
    ("--paste"*)
      tmp_file_name="/tmp/.mcp_clipboard"
      mcp -o ${tmp_file_name} -sf
      scp -q ${tmp_file_name} ${remote_host}:${tmp_file_name}
      ssh ${remote_host} "$REMOTE_MCP_PATH -i $tmp_file_name" 2>&1 > /dev/null
      echo -e "\033[01;30m$(date '+%Y-%m-%d %H:%M:%S') \033[01;00m[\033[01;32minfo  \033[01;30mmcp\033[01;00m]: \033[01;32mpasted to $remote_host."
      ;;
    *)
      echo -e "\033[01;30m$(date '+%Y-%m-%d %H:%M:%S') \033[01;00m[\033[01;31merror \033[01;30mmcp\033[01;00m]: \033[01;31mmode($mode) remote_host($remote_host)"
      echo ${USAGE}
      exit 0
  esac
  ```
