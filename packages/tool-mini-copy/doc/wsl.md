## FAQ

* Paste the code below to `~/.vimrc`

  1. Install `@guanghechen/tool-mini-copy` and then link the `mcp` to `/usr/bin/mcp`.

  2. Modify vim configure with below content.
      ```vimrc
      " for wsl bi-directional clipboard
      let s:clip_command = '/usr/bin/mcp'
      if executable(s:clip_command)
        let resolved_clip_command = s:clip_command.' --silence '
        let s:resolved_clip_command = resolved_clip_command
        function CopyToSystemClipBoard()
          if v:event.regname ==# '+' || v:event.regname ==# 'e'
            call system(s:resolved_clip_command.shellescape(join(v:event.regcontents, "\<CR>")))
          elseif v:event.regname ==# ''
            let @t = @"
          endif
        endfunction

        " for paste: replace `+` to `e` (as there could not exist register `+`)
        noremap p "tp
        noremap "+ "e
        noremap <silent> "+p :exe 'norm a'.system(resolved_clip_command.' --force')<CR><ESC>

        " for copy
        augroup WSLYank
          autocmd!
          autocmd TextYankPost * call CopyToSystemClipBoard()
        augroup END
      endif
      ```
