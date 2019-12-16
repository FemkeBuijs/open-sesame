#  Open Sesame
A backend application based on Node.js to control and manage user access.

## Getting Started

### Prerequisites
* Docker

When the project is used without Docker:
* npm or yarn
* Node 10

### Environment variables
This project uses environment variables. The environment variables are stored in the `.env` file in the root of the project. There is a .env.example file committed to this repo. Please create at .env file in the root of the project. The .env file is in `.gitignore`, and should never be committed. The example file should show the keys necessary.

You can find the environment variables in the accompanied document about the architecture of the project.

### Installing and starting the project

To install dependencies and have the project running locally run:

```
docker-compose up
```

The backend is then available by making HTTP requests to `localhost://3000`.

When done with the project, remove the containers using:

```
docker-compose down
```

## Without docker
To have the project running locally without Docker first run `npm install` and then `npm run dev`.

## Built With
* [Express](https://expressjs.com/) - Node.js framework.
