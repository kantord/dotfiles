local options = {
  formatters_by_ft = {
    lua = { "stylua" },
    css = { "prettier" },
    html = { "prettier" },
    javascript = { { "prettierd", "prettier" }, {"eslint_d"} },
    typescript = { { "prettierd", "prettier" }, {"eslint_d"} },
    javascriptreact = { { "prettierd", "prettier" }, {"eslint_d"} },
    typescriptreact = { { "prettierd", "prettier" }, {"eslint_d"} },
  },
  format_on_save = {
    -- These options will be passed to conform.format()
    timeout_ms = 500,
    lsp_fallback = true,
  },
}

require("conform").setup(options)
