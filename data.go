package main

import (
  "fmt"
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
  defer client.Disconnect(ctx)
  if err != nil {
      log.Fatal(err)
  }

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

func updateCollection(collection string, data []interface{}) error{
  client := getMongoClient()
  ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
  if err := client.Connect(ctx); err != nil {
    return err
    log.Fatal(err)
  }
  defer client.Disconnect(ctx)
  
  satDB := client.Database("sat")
  fmt.Printf("dropping collection %s... \n", collection)
  if err := satDB.Collection(collection).Drop(ctx); err != nil {
    log.Fatal(err)
    return err
  }
  fmt.Printf("recreating collection %s... \n", collection)
    _, err := satDB.Collection(collection).InsertMany(context.TODO(), data)
  if err != nil {
	 return err
  }
  return nil
}

