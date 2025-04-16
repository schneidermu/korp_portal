package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
)

func requestHandler(w http.ResponseWriter, r *http.Request) {
	// Log the request method and URL
	log.Printf("Received request: %s %s", r.Method, r.URL.Path)

	// Log the headers
	log.Println("Headers:")
	for name, headers := range r.Header {
		for _, h := range headers {
			log.Printf("  %s: %s", name, h)
		}
	}

	// Log the body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading body: %v", err)
	} else {
		log.Printf("Body: %s", string(body))
	}

	// Respond with a 200 status code
	fmt.Fprintln(w, "Request received")
}

func main() {
	http.HandleFunc("/", requestHandler)
	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Could not start server: %s\n", err.Error())
	}
}
