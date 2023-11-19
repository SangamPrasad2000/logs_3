# Log Ingestor and Query Interface

## Overview

This project consists of a log ingestor system and a query interface that allows efficient handling and querying of log data. The system includes features such as log ingestion over HTTP, full-text search, and specific field filters. The search functionality is enhanced with a Trie-based search algorithm for optimized performance.

## Log Ingestor

The log ingestor is responsible for efficiently handling and storing logs in the provided format. It includes mechanisms to scale for high volumes of logs, mitigate bottlenecks, and ingest logs via an HTTP server on port 3000.

## Query Interface

The query interface provides a user-friendly interface for searching logs. It supports full-text search and specific field filters, making it easy to retrieve relevant log data. The advanced search functionality is powered by a Trie-based search algorithm, offering optimized and fast search capabilities.

## Trie-based Search Algorithm

The Trie data structure is used to enhance search operations. It allows for efficient prefix-based searches, providing a quick way to look up log entries based on partial message queries.

## Requirements

- Node.js
- MongoDB (Make sure to update the connection string in the code)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
Install dependencies:
bash
Copy code
npm install
Set up MongoDB:

Install MongoDB locally or use a cloud-based solution.
Update the MongoDB connection string in your code.
Run the application:

bash
Copy code
npm start
The log ingestor will run on http://localhost:3000.

Usage
Log Ingestion
Use an HTTP client like Postman to ingest logs. Send POST requests to http://localhost:3000/logs with log data in the request body.

Query Interface
Access the query interface at http://localhost:3000. Use the provided UI or API endpoints to search for logs based on various criteria, leveraging the Trie-based search algorithm for enhanced performance.

Advanced Features
Real-time Log Ingestion and Searching
WebSocket communication is implemented to provide real-time log ingestion and searching capabilities.

Role-based Access Control
JWT authentication ensures that only users with the 'admin' role can access certain routes. Obtain a token via the /login route and include it in the Authorization header for protected routes.

Sample Queries
Here are some sample queries you can try:

Find all logs with the level set to "error".
Search for logs with the message containing the term "Failed to connect".
Retrieve all logs related to resourceId "server-1234".
Filter logs between the timestamp "2023-09-10T00:00:00Z" and "2023-09-15T23:59:59Z".
Contributing
Feel free to contribute to the development of this project. Submit issues or pull requests for improvements.



how to run this code

-1 cd log-query interface 
-2 npm start - this will start your react file


3- add a termianl in vs code
4 - node logingestor.js
