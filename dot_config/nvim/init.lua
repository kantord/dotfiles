-- Bootstrap lazy.nvim
local lazypath = vim.fn.stdpath 'data' .. '/lazy/lazy.nvim'
if not (vim.uv or vim.loop).fs_stat(lazypath) then
  local lazyrepo = 'https://github.com/folke/lazy.nvim.git'
  local out = vim.fn.system { 'git', 'clone', '--filter=blob:none', '--branch=stable', lazyrepo, lazypath }
  if vim.v.shell_error ~= 0 then
    error('Error cloning lazy.nvim:\n' .. out)
  end
end
vim.opt.rtp:prepend(lazypath)

-- Options
vim.o.expandtab = true
vim.o.shiftwidth = 2
vim.o.tabstop = 2
vim.o.softtabstop = 2
vim.o.smartindent = true
vim.o.breakindent = true

-- Plugins
require('lazy').setup({
  { 'NMAC427/guess-indent.nvim', opts = {} },

  {
    'ibhagwan/fzf-lua',
    dependencies = { 'nvim-tree/nvim-web-devicons' },
    opts = {},
    keys = {
      { '<C-p>', '<cmd>FzfLua files<cr>', desc = 'Find files' },
      -- { '<leader>sg', '<cmd>FzfLua live_grep<cr>', desc = 'Search by grep' },
      -- { '<leader>sb', '<cmd>FzfLua buffers<cr>', desc = 'Search buffers' },
      -- { '<leader>sh', '<cmd>FzfLua help_tags<cr>', desc = 'Search help' },
      -- { '<leader>sr', '<cmd>FzfLua resume<cr>', desc = 'Search resume' },
      -- { '<leader>sd', '<cmd>FzfLua diagnostics_document<cr>', desc = 'Search diagnostics' },
      -- { '<leader>sw', '<cmd>FzfLua grep_cword<cr>', desc = 'Search current word' },
      -- { '<leader>/', '<cmd>FzfLua grep_curbuf<cr>', desc = 'Grep current buffer' },
    },
  },

  {
    'neovim/nvim-lspconfig',
    dependencies = {
      { 'mason-org/mason.nvim', opts = {} },
      'mason-org/mason-lspconfig.nvim',
      'WhoIsSethDaniel/mason-tool-installer.nvim',
    },
    config = function()
      local servers = {
        lua_ls = {},
        pyright = {},
        rust_analyzer = {},
        ts_ls = {},
        html = {},
        cssls = {},
      }

      require('mason-tool-installer').setup {
        ensure_installed = vim.tbl_keys(servers),
      }

      for name, config in pairs(servers) do
        vim.lsp.config(name, config)
        vim.lsp.enable(name)
      end
    end,
  },

  {
    'nvim-treesitter/nvim-treesitter',
    branch = 'main',
    build = ':TSUpdate',
    config = function()
      local parsers = {
        'lua', 'python', 'rust', 'typescript', 'tsx',
        'javascript', 'html', 'css', 'json', 'yaml',
        'toml', 'bash', 'markdown', 'markdown_inline',
        'vim', 'vimdoc',
      }
      require('nvim-treesitter').install(parsers)

      vim.api.nvim_create_autocmd('FileType', {
        callback = function(args)
          local lang = vim.treesitter.language.get_lang(args.match)
          if lang and vim.treesitter.language.add(lang) then
            vim.treesitter.start(args.buf, lang)
            vim.bo[args.buf].indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
          end
        end,
      })
    end,
  },
})
