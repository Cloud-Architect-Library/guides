FROM node:20-bookworm

# Install basic development tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces/guides

# Expose the Docusaurus port
EXPOSE 3000

# Keep the container running
CMD ["sleep", "infinity"]
