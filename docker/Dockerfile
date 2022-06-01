FROM golang:1.18.2-bullseye

RUN mkdir /satviz
WORKDIR /satviz

COPY app.go /satviz/
COPY static /satviz/static

RUN go mod init satviz
RUN go mod tidy

ENTRYPOINT go run app.go
