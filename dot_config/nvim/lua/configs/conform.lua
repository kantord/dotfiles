local options = {
  formatters_by_ft = {
    lua = { "stylua" },
    css = { "prettier" },
    html = { "prettier" },
    javascript = { { "prettierd", "prettier" }, {"eslint_d"} },
    typescript = { { "prettierd", "prettier" }, {"eslint_d"} },
    javascriptreact = { { "prettierd", "prettier" }, {"eslint_d"} },
    typescriptreact = { { "prettierd", "prettier" }, {"eslint_d"} },
  }
}

require("conform").setup(options)
