# Security: Use stable base image (CWE-829: Inclusion of Functionality from Untrusted Control Sphere)
FROM node:20-bookworm

# Install basic development tools and GitHub CLI
RUN apt-get update && apt-get install -y \
    git \
    curl \
    gnupg \
    && mkdir -p -m 755 /etc/apt/keyrings \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | gpg --dearmor -o /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces/guides
# Security: Create non-privileged user to avoid running as root (CWE-250: Execution with Unnecessary Privileges)
# This follows the principle of least privilege
RUN groupadd -g 1000 node-user && \
    useradd -u 1000 -g node-user -m -s /bin/bash node-user && \
    chown -R node-user:node-user /workspaces


# Expose the Docusaurus port
# Switch to non-privileged user for all subsequent operations
USER node-user

EXPOSE 3000

# Keep the container running
CMD ["sleep", "infinity"]
