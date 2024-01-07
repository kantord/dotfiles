-- Read the docs: https://www.lunarvim.org/docs/configuration
-- Video Tutorials: https://www.youtube.com/watch?v=sFA9kX-Ud_c&list=PLhoH5vyxr6QqGu0i7tt_XoVK9v-KvZ3m6
-- Forum: https://www.reddit.com/r/lunarvim/
-- Discord: https://discord.com/invite/Xb9B4Ny


lvim.plugins = {
  { 'simrat39/rust-tools.nvim' },
  -- {
  --   "zbirenbaum/copilot.lua",
  --   event = { "VimEnter" },
  --   config = function()
  --     vim.defer_fn(function()
  --       require("copilot").setup {
  --         suggestion = { enabled = false },
  --         panel = { enabled = false },
  --       }
  --     end, 100)
  --   end,
  -- },
  { 'sainnhe/sonokai' },
  { "mg979/vim-visual-multi" },
  { 'MattesGroeger/vim-bookmarks' },
  { 'ledger/vim-ledger' },
  { 'mcchrish/zenbones.nvim',     dependencies = { "rktjmp/lush.nvim" } },
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
    }
  },
  { "rcarriga/nvim-dap-ui", dependencies = { "mfussenegger/nvim-dap" } },
  {
    "kantord/auto-save-format.nvim",
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
      jestCommand = "yarn test --watch",
    }),
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
