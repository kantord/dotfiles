vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1

-- Leader
vim.g.mapleader = ' '
vim.g.maplocalleader = ' '
vim.keymap.set({ 'n', 'v' }, '<Space>', '<Nop>')

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
vim.o.number = true
vim.o.relativenumber = true

local no_line_numbers = { gitcommit = true, gitrebase = true, help = true, man = true, checkhealth = true }

vim.api.nvim_create_autocmd('InsertEnter', {
  callback = function() vim.wo.relativenumber = false end,
})
vim.api.nvim_create_autocmd('InsertLeave', {
  callback = function()
    if not no_line_numbers[vim.bo.filetype] then
      vim.wo.relativenumber = true
    end
  end,
})

vim.api.nvim_create_autocmd('FileType', {
  pattern = { 'gitcommit', 'gitrebase', 'help', 'man', 'checkhealth' },
  callback = function()
    vim.wo.number = false
    vim.wo.relativenumber = false
  end,
})

vim.o.expandtab = true
vim.o.shiftwidth = 2
vim.o.tabstop = 2
vim.o.softtabstop = 2
vim.o.breakindent = true

vim.o.scrolloff = 10
vim.o.ignorecase = true
vim.o.smartcase = true
vim.o.inccommand = 'nosplit'
vim.o.splitright = true
vim.o.splitbelow = true
vim.o.signcolumn = 'yes'
vim.o.undofile = true

vim.schedule(function() vim.o.clipboard = 'unnamedplus' end)

vim.diagnostic.config {
  update_in_insert = false,
}

vim.api.nvim_create_autocmd('TextYankPost', {
  callback = function() vim.hl.on_yank() end,
})

-- Keymaps
-- LSP keymaps (set automatically by Neovim 0.10+ when a client attaches):
--   gd        go to definition
--   K         hover
--   grr       references
--   grn       rename
--   gra       code action
--   gri       implementation
--   gO        document symbols
--   <C-s>     signature help (insert mode)
vim.keymap.set('n', '<Esc>', '<cmd>nohlsearch<CR>')
vim.keymap.set('n', 'j', 'gj')
vim.keymap.set('n', 'k', 'gk')
vim.keymap.set('n', '<C-h>', '<C-w>h', { desc = 'Move to left window' })
vim.keymap.set('n', '<C-j>', '<C-w>j', { desc = 'Move to lower window' })
vim.keymap.set('n', '<C-k>', '<C-w>k', { desc = 'Move to upper window' })
vim.keymap.set('n', '<C-l>', '<C-w>l', { desc = 'Move to right window' })

-- Plugins
require('lazy').setup({
  { 'NMAC427/guess-indent.nvim', opts = {} },
  { 'lewis6991/gitsigns.nvim', opts = {} },

  {
    'mikavilpas/yazi.nvim',
    event = 'VeryLazy',
    dependencies = { 'nvim-lua/plenary.nvim' },
    keys = {
      { '-', '<cmd>Yazi<cr>', desc = 'Open yazi at current file' },
      { '<leader>cw', '<cmd>Yazi cwd<cr>', desc = 'Open yazi in cwd' },
    },
    opts = {},
  },

  {
    'folke/which-key.nvim',
    event = 'VimEnter',
    opts = {
      delay = 300,
    },
  },

  {
    'ibhagwan/fzf-lua',
    dependencies = { 'nvim-tree/nvim-web-devicons' },
    opts = {},
    keys = {
      { '<C-p>', '<cmd>FzfLua files<cr>', desc = 'Find files' },
      { '<C-g>', '<cmd>FzfLua live_grep<cr>', desc = 'Live grep' },
      {
        '<leader>cs',
        function()
          local colors_dir = vim.fn.fnamemodify(vim.env.VIMRUNTIME .. '/colors', ':p')
          local builtins = vim.tbl_map(
            function(f) return '^' .. f:gsub('%..*$', '') .. '$' end,
            vim.fn.readdir(colors_dir, function(f) return f ~= 'README' end)
          )
          require('fzf-lua').colorschemes({ ignore_patterns = builtins })
        end,
        desc = 'Colorschemes',
      },
      -- { '<leader>sb', '<cmd>FzfLua buffers<cr>', desc = 'Search buffers' },
      -- { '<leader>sh', '<cmd>FzfLua help_tags<cr>', desc = 'Search help' },
      -- { '<leader>sr', '<cmd>FzfLua resume<cr>', desc = 'Search resume' },
      -- { '<leader>sd', '<cmd>FzfLua diagnostics_document<cr>', desc = 'Search diagnostics' },
      -- { '<leader>sw', '<cmd>FzfLua grep_cword<cr>', desc = 'Search current word' },
      -- { '<leader>/', '<cmd>FzfLua grep_curbuf<cr>', desc = 'Grep current buffer' },
    },
  },

  {
    'saghen/blink.cmp',
    dependencies = { 'rafamadriz/friendly-snippets' },
    version = '1.*',
    opts = {
      keymap = { preset = 'default' },
      completion = { documentation = { auto_show = true } },
      signature = { enabled = true },
      sources = {
        default = { 'lsp', 'path', 'snippets', 'buffer' },
      },
      fuzzy = { implementation = 'prefer_rust_with_warning' },
    },
  },

  {
    'neovim/nvim-lspconfig',
    dependencies = {
      { 'mason-org/mason.nvim', opts = {} },
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
        ensure_installed = {
          'lua-language-server',
          'pyright',
          'rust-analyzer',
          'typescript-language-server',
          'html-lsp',
          'css-lsp',
          'stylua',
          'black',
        },
      }

      for name, config in pairs(servers) do
        vim.lsp.config(name, config)
        vim.lsp.enable(name)
      end
    end,
  },

  -- Colorschemes
  { 'rose-pine/neovim', name = 'rose-pine', priority = 1000, config = function() vim.cmd.colorscheme 'rose-pine' end },
  { 'folke/tokyonight.nvim', lazy = true },
  { 'catppuccin/nvim', name = 'catppuccin', lazy = true },
  { 'rebelot/kanagawa.nvim', lazy = true },
  { 'sainnhe/gruvbox-material', lazy = true },

  {
    'okuuva/auto-save.nvim',
    event = { 'InsertLeave', 'TextChanged' },
    opts = {
      debounce_delay = 3000,
    },
  },

  {
    'stevearc/conform.nvim',
    cmd = { 'ConformInfo' },
    keys = {
      { '<leader>f', function() require('conform').format { async = true, lsp_format = 'fallback' } end, mode = '', desc = 'Format buffer' },
    },
    opts = {
      formatters_by_ft = {
        lua = { 'stylua' },
        python = { 'black' },
      },
    },
  },

  {
    'MeanderingProgrammer/render-markdown.nvim',
    ft = { 'markdown', 'codecompanion' },
    opts = {
      -- Conservative defaults for regular markdown: no character replacement
      bullet = { enabled = false },
      checkbox = { enabled = false },
      link = { enabled = false },
      heading = { sign = false, icons = {} },
      win_options = {
        conceallevel = { default = vim.o.conceallevel, rendered = 0 },
      },
      -- Purely additive decorations: fine everywhere
      -- (callout has no enabled flag — entries in the table = enabled by default)
      code = { enabled = true, conceal_delimiters = false, border = 'none', language = false },
      dash = { enabled = true },
      -- Full rendering only in codecompanion (read-mostly chat buffer)
      overrides = {
        filetype = {
          codecompanion = {
            render_modes = { 'n', 'i', 'v', 'c', 't' },
            sign = { enabled = false },
            bullet = { enabled = true },
            checkbox = { enabled = true },
            link = { enabled = true },
            heading = { sign = false, icons = { '󰲡 ', '󰲣 ', '󰲥 ', '󰲧 ', '󰲩 ', '󰲫 ' } },
          },
        },
      },
    },
  },

  {
    'olimorris/codecompanion.nvim',
    dependencies = {
      'nvim-lua/plenary.nvim',
      'nvim-treesitter/nvim-treesitter',
      'MeanderingProgrammer/render-markdown.nvim',
    },
    keys = {
      { '<C-a>', '<cmd>CodeCompanionActions<cr>', mode = { 'n', 'v' }, desc = 'CodeCompanion actions' },
      { '<leader>cc', '<cmd>CodeCompanionChat Toggle<cr>', mode = { 'n', 'v' }, desc = 'CodeCompanion chat' },
      { 'ga', '<cmd>CodeCompanionChat Add<cr>', mode = 'v', desc = 'Add to CodeCompanion chat' },
    },
    opts = {
      strategies = {
        chat = { adapter = 'claude_code' },
        inline = { adapter = 'claude_code' },
      },
      display = {
        chat = { render_headers = false },
      },
    },
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
