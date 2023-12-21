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
  {
    "nvim-neotest/neotest",
    dependencies = {
      "nvim-lua/plenary.nvim",
      "nvim-treesitter/nvim-treesitter",
      "antoinemadec/FixCursorHold.nvim",
      "nvim-neotest/neotest-python",
      'haydenmeade/neotest-jest',
    }
  },
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
