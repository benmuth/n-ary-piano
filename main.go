package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./index.html")
	})

	// http.HandleFunc("/node_modules/", func(w http.ResponseWriter, r *http.Request) {
	// 	http.ServeFile(w, r, "./node_modules/tone/build/Tone.js")
	// })

	// http.HandleFunc("/Tone.js.map", func(w http.ResponseWriter, r *http.Request) {
	// 	http.ServeFile(w, r, "./node_modules/tone/build/Tone.js.map")
	// })

	http.HandleFunc("/js/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "js/n-ary-piano.js")
	})

	http.HandleFunc("/css/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "css/styles.css")
	})

	fmt.Println("running. . .")
	log.Fatal(http.ListenAndServe(":8080", nil))
}