-- Read the docs: https://www.lunarvim.org/docs/configuration
-- Video Tutorials: https://www.youtube.com/watch?v=sFA9kX-Ud_c&list=PLhoH5vyxr6QqGu0i7tt_XoVK9v-KvZ3m6
-- Forum: https://www.reddit.com/r/lunarvim/
-- Discord: https://discord.com/invite/Xb9B4Ny


lvim.plugins = {
  {
    "zbirenbaum/copilot.lua",
    event = { "VimEnter" },
    config = function()
      vim.defer_fn(function()
        require("copilot").setup {
          suggestion = { enabled = false },
          panel = { enabled = false },
        }
      end, 100)
    end,
  },
  { 'sainnhe/sonokai' },
  { "mg979/vim-visual-multi" },
  { 'MattesGroeger/vim-bookmarks' },
  { 'ledger/vim-ledger' },
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
  {
    "kantord/auto-save-format.nvim",
    config = function()
      require("auto-save").setup {
        debounce_delay = 2000,
      }
    end,
  },
  { 'antoinemadec/FixCursorHold.nvim' }, -- still needed: https://github.com/nvim-neotest/neotest?tab=readme-ov-file#installation
  { "folke/neodev.nvim",              opts = {} }
  -- { "roverdotcom/pawfect.nvim" },
}


require("neotest").setup({
  adapters = {
    require("neotest-python"),
    -- require("neotest-plenary"),
    require('neotest-jest')({
      jestCommand = "jest --watch ",
    }),
  }
})


lvim.colorscheme = "sonokai"

lvim.lsp.installer.setup.ensure_installed = { "tsserver", "pyright", "bashls", "rust_analyzer",
  "yamlls", "marksman" }
