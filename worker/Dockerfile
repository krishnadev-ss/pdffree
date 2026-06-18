FROM golang:1.22-bookworm AS builder

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /worker ./cmd/worker

FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        poppler-utils \
        tesseract-ocr \
        ghostscript \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /worker /worker

USER nobody:nogroup

ENTRYPOINT ["/worker"]
