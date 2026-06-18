FROM golang:1.22-alpine AS builder

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /api ./cmd/api

FROM gcr.io/distroless/static:nonroot

COPY --from=builder /api /api

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/api"]
