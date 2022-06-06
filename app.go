package main

import (
  "net/http"
  "log"
  "encoding/json"
  "strings"
  "context"
  "time"
  "os"
  "go.mongodb.org/mongo-driver/bson"
  "go.mongodb.org/mongo-driver/mongo"
  "go.mongodb.org/mongo-driver/mongo/options"
)

func main(){
    http.HandleFunc("/", rootHandler)
    staticHandler := http.StripPrefix("/static/", http.FileServer(http.Dir("./static")))
    http.Handle("/static/", staticHandler)
    http.HandleFunc("/data/", dataHandler)
    log.Print("Server listening on port 8000...")
    http.ListenAndServe(":8000", nil)
}

func rootHandler(w http.ResponseWriter, r *http.Request){
  http.ServeFile(w, r, "static/home.html")
}

func dataHandler(w http.ResponseWriter, r *http.Request){
  collection := strings.TrimPrefix(r.URL.Path, "/data/")
  data := getMongoCollection(collection)
  w.Header().Set("Content-Type", "application/json")
  w.WriteHeader(http.StatusCreated)
  json.NewEncoder(w).Encode(data)
}

func getMongoClient() *mongo.Client{
  mongoURI := os.Getenv("MONGO_URI")
  client, err := mongo.NewClient(options.Client().ApplyURI(mongoURI))
  if err != nil {
      log.Fatal(err)
  }
  return client
}

func getMongoCollection(collection string)([]bson.M){
  client := getMongoClient()
  ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
  err := client.Connect(ctx)
  if err != nil {
      log.Fatal(err)
  }
  defer client.Disconnect(ctx)

  satDB := client.Database("sat")
  cursor, err := satDB.Collection(collection).Find(ctx, bson.M{})
  if err != nil {
      log.Fatal(err)
  }
  var data []bson.M
  if err = cursor.All(ctx, &data); err != nil {
      log.Fatal(err)
  }
  
  return data
}