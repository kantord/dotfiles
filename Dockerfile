FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu
ENV CODESPACES=true
COPY . /workspace
WORKDIR /workspace
RUN ./bootstrap.sh
CMD ["/bin/zsh"]
