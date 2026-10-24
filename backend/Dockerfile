# Build stage
FROM golang:1.27-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o skysignallab ./cmd/main.go

# Run stage
FROM alpine:3.24

WORKDIR /app

# Install certificates for HTTPS calls
RUN apk --no-cache add ca-certificates

# Copy binary from builder
COPY --from=builder /app/skysignallab .

EXPOSE 8080

CMD ["./skysignallab"]