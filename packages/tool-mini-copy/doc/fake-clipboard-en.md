`--fake-clipboard` option is designed for non-gui server.

## usage

```bash
mcp --fake-clipboard <filepath>
```

* the `--fake-clipboard` option specify the tmp file which use as a fake-clipboard

## Examples

* rename mcp
  ```bash
  cd /home/demo/.yarn/bin
  mv mcp mcp_real
  ```

* create a shell script `/usr/bin/mcp` with content:
  ```bash
  #! /usr/bin/env bash

  # I suppose that your mcp (installed by npm) is located at `/home/demo/.yarn/bin/mcp`
  COMMAND_PATH=/home/demo/.yarn/bin/mcp_real

  # the temp file which you want to make as a fake-clipboard
  FAKE_CLIPBOARD_PATH=/tmp/.fake_clip_board

  # pass all the arguments to mcp_real
  $COMMAND_PATH --fake-clipboard $FAKE_CLIPBOARD_PATH $*
  ```

* if you don't want to share clipboard with other users in the system. you could just move the mcp to a local execute path, and specify difference fake-clipboard file with difference file permission.


## config for tmux
* edit `.tmux.conf`
  ```conf
   bind-key -T copy-mode-vi y send-keys -X copy-selection-and-cancel \;\
      run "tmux save-buffer - | /usr/bin/mcp --silence" \;\
      display-message "Clipboard copied"
  ```
* then shortcut(`y`) should work for you to copy content to your fake-clipboard under the copy-mode in tmux


## config for vim

* paste the code below to `~/.vimrc`
  ```vimrc
  " for vim share fake_clip
  let s:clip_command = '/usr/bin/mcp'
  if executable(s:clip_command)
    let resolved_clip_command = s:clip_command.' --silence '
    let s:resolved_clip_command = resolved_clip_command
    function CopyToSystemClipBoard()
      echom 'regname#'.v:event.regname.'#'
      if v:event.regname ==# '+' || v:event.regname ==# 'e'
        call system('echo '.shellescape(join(v:event.regcontents, "\n")).' | '.s:resolved_clip_command)
      elseif v:event.regname ==# ''
        let @t = @"
      endif
    endfunction

    " for paste: replace `+` to `e` (as there could not exist register `+`)
    noremap "+ "e
    noremap <silent> "+p :exe 'norm a'.system(resolved_clip_command.' --force')<CR><ESC>
    noremap p "tp

    " for copy
    augroup WSLYank
      autocmd!
      autocmd TextYankPost * call CopyToSystemClipBoard()
    augroup END
  endif
  ```

* then, you can use `"+y` and `"+p` to share content to your remote machine's fake-clipboard


## ssh copy

* edit `/usr/bin/mcp`
  ```bash
  # specify the node path for ssh execute
  # for example:
  # export PATH=$PATH:/home/node/bin
  ```

* run `ssh <remove-host> "/usr/bin/mcp --force" | <local-clipboard>`
  - if you install `@guanghechen/tool-mini-copy` on your local machine, then you can use `mcp`
    instead of `<local-clipboard>`.

* use script
  - make sure you have config ssh properly
  - install `@guanghechen/tool-mini-copy` on your local machine (or just use your system clipboard)
  - create a script to `/usr/bin/remote-mcp` with content (need `mcp-copy-cli@1.3.4^`):
    ```bash
    #! /usr/bin/env bash

    USAGE='usage: remote-mcp [--(copy|paste)] [remote-hostname]'

    mode='--copy'
    remote_host='remote-host'
    REMOTE_MCP_PATH='/usr/bin/mcp'
    LOCAL_MCP_PATH='mcp' # change here, if you haven't install `@guanghechen/tool-mini-copy` on your local machine. You can use the path of your system clipboard command to instead.

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
