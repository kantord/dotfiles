require "nvchad.mappings"

-- add yours here

local map = vim.keymap.set
local builtin = require('telescope.builtin')

map("n", ";", ":", { desc = "CMD enter command mode" })
map("i", "jk", "<ESC>")
map('n', '<leader>j', builtin.find_files, { })

-- map({ "n", "i", "v" }, "<C-s>", "<cmd> w <cr>")
