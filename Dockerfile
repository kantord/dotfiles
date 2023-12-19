# Use Arch Linux as the base image
FROM archlinux:latest

# Install bare necessities
RUN pacman -Syu --noconfirm git chezmoi

# Set up a non-root user (recommended for security reasons)
RUN useradd -m kantord
user kantord
WORKDIR /home/kantord

# Apply Chezmoi configurations from the specified GitHub user
RUN chezmoi init --apply kantord

# Set the default command for the container
CMD ["/bin/bash"]
