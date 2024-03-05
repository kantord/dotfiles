-- Read the docs: https://www.lunarvim.org/docs/configuration
-- Video Tutorials: https://www.youtube.com/watch?v=sFA9kX-Ud_c&list=PLhoH5vyxr6QqGu0i7tt_XoVK9v-KvZ3m6
-- Forum: https://www.reddit.com/r/lunarvim/
-- Discord: https://discord.com/invite/Xb9B4Ny


lvim.plugins = {
  -- { 'justinmk/vim-sneak' }, -- no need for this, leap is more modern
  { "catppuccin/nvim",  name = "catppuccin", priority = 1000 },
  { 'ggandor/leap.nvim' },
  -- make ui really nice
  {
    'stevearc/dressing.nvim',
    opts = {},
  },
  { 'NvChad/nvim-colorizer.lua' },
  { 'rebelot/kanagawa.nvim' },
  {
    'AlexvZyl/nordic.nvim',
    lazy = false,
    priority = 1000,
    config = function()
      require 'nordic'.load()
    end
  },
  { 'nyoom-engineering/oxocarbon.nvim' },
  {
    'mrcjkb/rustaceanvim',
    version = '^4', -- Recommended
    ft = { 'rust' },
  },
  {
    "zbirenbaum/copilot.lua",
    cmd = "Copilot",
    event = "InsertEnter",
  },
  {
    "zbirenbaum/copilot-cmp",
    after = { "copilot.lua" },
    config = function()
      require("copilot_cmp").setup()
    end,
  },
  { 'sainnhe/sonokai' },
  { "mg979/vim-visual-multi" },
  { 'MattesGroeger/vim-bookmarks' },
  { 'ledger/vim-ledger' },
  { 'mcchrish/zenbones.nvim',          dependencies = { "rktjmp/lush.nvim" } },
  { 'folke/todo-comments.nvim' },
  {
    "nvim-neotest/neotest",
    dependencies = {
      "nvim-lua/plenary.nvim",
      "nvim-treesitter/nvim-treesitter",
      "antoinemadec/FixCursorHold.nvim",
      "nvim-neotest/neotest-python",
      'haydenmeade/neotest-jest',
      'rouge8/neotest-rust',
      "thenbe/neotest-playwright",
    }
  },
  { "rcarriga/nvim-dap-ui", dependencies = { "mfussenegger/nvim-dap" } },
  {
    "pocco81/auto-save.nvim",
    config = function()
      require("auto-save").setup {
        debounce_delay = 2000,
      }
    end,
  },
  -- { 'antoinemadec/FixCursorHold.nvim' }, -- still needed: https://github.com/nvim-neotest/neotest?tab=readme-ov-file#installation
  -- { "folke/neodev.nvim",              opts = {} },
  { 'eugen0329/vim-esearch' },
  -- { "roverdotcom/pawfect.nvim" },
  {
    dev = true,
    dir = "$HOME/.config/pawfect.nvim"
  },
  { "levouh/tint.nvim" }, -- this should be the last thing to load
  { "vimwiki/vimwiki" },
  { "kevinhwang91/rnvimr" },
}


-- testing
require("neotest").setup({
  adapters = {
    require("neotest-python"),
    -- require("neotest-plenary"),
    require('neotest-jest')({
      jestCommand = "npm test --",
      -- jestConfigFile = "custom.jest.config.ts",
      env = { CI = true },
      cwd = function(path)
        return vim.fn.getcwd()
      end,
    }),
    require("neotest-playwright").adapter({
      options = {
        persist_project_selection = false,
        enable_dynamic_test_discovery = true,
        get_playwright_config = function()
          return vim.loop.cwd() + "/playwright.config.ts"
        end,
      }
    }),
    require("neotest-rust") {
      args = { "--no-capture" },
    }
  }
})

lvim.keys.normal_mode["<leader>tt"] = ':lua require("neotest").run.run()<CR>'
lvim.keys.normal_mode["<leader>td"] = ':lua require("neotest").run.run({strategy = "dap"})<CR>'
lvim.keys.normal_mode["<leader>ta"] = ':lua require("neotest").run.run(vim.fn.expand("%"))<CR>'
lvim.keys.normal_mode["<leader>tA"] = ':lua require("neotest").run.run(vim.fn.getcwd())<CR>'

-- colorscheme
lvim.colorscheme = "duckbones"

-- make sure lsps are installed
lvim.lsp.installer.setup.ensure_installed = { "tsserver", "pyright", "bashls", "rust_analyzer",
  "yamlls", "marksman", "eslint" }

vim.g.esearch = {
  live_update = true,
}

lvim.builtin.which_key.mappings.j = lvim.builtin.which_key.mappings.f
lvim.builtin.which_key.mappings.f = nil


-- local formatters = require "lvim.lsp.null-ls.formatters"
-- formatters.setup { { name = "eslint", filetypes = { "typescript", "typescriptreact" }, args = { "-c", "/home/kantord/repos/web/src/frontend/.eslintrc.js" } } }

-- local linters = require "lvim.lsp.null-ls.linters"


local formatters = require "lvim.lsp.null-ls.formatters"
formatters.setup {
  {
    name = "eslint",
  }
}

local linters = require "lvim.lsp.null-ls.linters"
linters.setup {
  {
    name = "eslint",
  }
}

local code_actions = require "lvim.lsp.null-ls.code_actions"
code_actions.setup {
  {
    name = "eslint",
  },
}

require("tint").setup()







local actions = require('telescope.actions')
local conf = require('telescope.config').values
local finders = require('telescope.finders')
local pickers = require('telescope.pickers')
local sorters = require('telescope.sorters')
local make_entry = require('telescope.make_entry')

local function debounce(func, delay)
  local timer_id = nil
  return function(...)
    local args = { ... }
    if timer_id then
      vim.fn.timer_stop(timer_id)
    end
    timer_id = vim.fn.timer_start(delay, function()
      func(unpack(args))
    end)
  end
end

function seagoat_lines(opts)
  opts = opts or {}
  opts.cwd = opts.cwd and vim.fn.expand(opts.cwd) or vim.loop.cwd()

  local debounce_delay = 1 -- Delay in milliseconds

  local debounced_job = debounce(function(prompt)
    return { "gt", "--vimgrep", prompt }
  end, debounce_delay)

  local live_seagoat = finders.new_job(function(prompt)
    if not prompt or prompt == "" then
      return nil
    end
    return debounced_job(prompt)
  end, opts.entry_maker or make_entry.gen_from_string(opts), opts.max_results, opts.cwd)

  pickers.new(opts, {
    prompt_title = "Seagoat Lines",
    finder = live_seagoat,
    previewer = conf.grep_previewer(opts),
    sorter = sorters.highlighter_only(opts),
    attach_mappings = function(_, map)
      map("i", "<c-space>", actions.to_fuzzy_refine)
      return true
    end,
  }):find()
end

vim.api.nvim_create_user_command('SeagoatLines', seagoat_lines, {})


vim.g.vimwiki_list = { {
  syntax = "markdown",
  ext = ".md",
} }

vim.opt.number = true
vim.opt.relativenumber = true


local ok, copilot = pcall(require, "copilot")
if not ok then
  return
end

copilot.setup {
  suggestion = {
    keymap = {
      accept = "<c-l>",
      next = "<c-j>",
      prev = "<c-k>",
      dismiss = "<c-h>",
    },
  },
}

local opts = { noremap = true, silent = true }
vim.api.nvim_set_keymap("n", "<c-s>", "<cmd>lua require('copilot.suggestion').toggle_auto_trigger()<CR>", opts)

require("colorizer").setup {
  filetypes = { "*" },
  user_default_options = {
    RGB = true,           -- #RGB hex codes
    RRGGBB = true,        -- #RRGGBB hex codes
    names = true,         -- "Name" codes like Blue or blue
    RRGGBBAA = false,     -- #RRGGBBAA hex codes
    AARRGGBB = false,     -- 0xAARRGGBB hex codes
    rgb_fn = false,       -- CSS rgb() and rgba() functions
    hsl_fn = false,       -- CSS hsl() and hsla() functions
    css = false,          -- Enable all CSS features: rgb_fn, hsl_fn, names, RGB, RRGGBB
    css_fn = false,       -- Enable all CSS *functions*: rgb_fn, hsl_fn
    -- Available modes for `mode`: foreground, background,  virtualtext
    mode = "virtualtext", -- Set the display mode.
    -- Available methods are false / true / "normal" / "lsp" / "both"
    -- True is same as normal
    tailwind = true,                                 -- Enable tailwind colors
    -- parsers can contain values used in |user_default_options|
    sass = { enable = false, parsers = { "css" }, }, -- Enable sass colors
    virtualtext = "■",
    -- update color values even if buffer is not focused
    -- example use: cmp_menu, cmp_docs
    always_update = false
  },
  -- all the sub-options of filetypes apply to buftypes
  buftypes = {},
}

vim.o.guifont = "MonaspiceNe Nerd Font"
