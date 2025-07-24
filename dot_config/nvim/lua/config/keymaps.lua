-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Add any additional keymaps here

-- Map Space+J to find files (same as <leader>f)
vim.keymap.set("n", "<leader>j", "<cmd>lua Snacks.picker.files()<cr>", { desc = "Find Files" })

