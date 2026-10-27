FROM python:3.10.10-bullseye AS builder

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# uv lives outside /usr/local so the runtime stage, which copies /usr/local,
# does not ship it. Syncing into /usr/local installs into the image's own
# Python instead of a project venv.
COPY --from=ghcr.io/astral-sh/uv:0.12.3 /uv /bin/uv
ENV UV_PROJECT_ENVIRONMENT=/usr/local \
    UV_PYTHON_DOWNLOADS=never

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-cache

COPY ./backend .

FROM python:3.10-slim-bullseye

WORKDIR /usr/src/app

# Copy Python packages installed in the builder stage
COPY --from=builder /usr/local /usr/local

# Copy the application code
COPY --from=builder /usr/src/app /usr/src/app

ARG USERNAME=appuser
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME
