package main

import (
  "log"
  "os"
  "time"
  "context"
  "go.mongodb.org/mongo-driver/bson"
  "go.mongodb.org/mongo-driver/mongo"
  "go.mongodb.org/mongo-driver/mongo/options"
)

func getMongoClient() *mongo.Client{
  mongoURI := os.Getenv("MONGO_URI")
  client, err := mongo.NewClient(options.Client().ApplyURI(mongoURI))
  if err != nil {
      log.Fatal(err)
  }
  return client
}

func getCollectionData(collection string)([]bson.M){
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
