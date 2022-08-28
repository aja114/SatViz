package main

import (
  "net/http"
  "log"
  "encoding/json"
  "strings"
)

func main(){
    rootHandler := http.HandlerFunc(serveHome)
    http.Handle("/", rootHandler)
    staticHandler := http.StripPrefix("/static/", http.FileServer(http.Dir("./static")))
    http.Handle("/static/", staticHandler)
    http.HandleFunc("/data/", dataHandler)
    http.HandleFunc("/data/update", updateDataFunc)
    log.Print("Server listening on port 8000...")
    http.ListenAndServe(":8000", nil)
}

func serveHome(w http.ResponseWriter, r *http.Request){
  if r.URL.Path != "/" {
    http.NotFound(w, r)
  } else {
    http.ServeFile(w, r, "static/home.html")
  }
}

func dataHandler(w http.ResponseWriter, r *http.Request){
  collection := strings.TrimPrefix(r.URL.Path, "/data/")
  data := getCollectionData(collection)
  w.Header().Set("Content-Type", "application/json")
  w.WriteHeader(http.StatusCreated)
  json.NewEncoder(w).Encode(data)
}

func updateDataFunc(w http.ResponseWriter, r *http.Request){
  err := updateData()
  if err != nil{
    w.Header().Set("Content-Type", "application/json; charset=utf-8")
    w.Header().Set("X-Content-Type-Options", "nosniff")
    w.WriteHeader(http.StatusInternalServerError)
    json.NewEncoder(w).Encode(err)
  } else{
    http.Redirect(w, r, "/", 301)
  }
}
