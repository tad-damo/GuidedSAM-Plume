# Installation instructions

This project is derived from the [SAM 2 Demo](https://github.com/facebookresearch/sam2/tree/main/demo) from [Meta FAIR](https://ai.meta.com/research/).
It consists of a frontend built with React TypeScript and Vite and a backend service using Python Flask and Strawberry GraphQL. In this way, the app may be hosted on remote servers if more powerful GPU resources are needed for example. However, it can also be fully run on a personnal computer.
Both components can be run in Docker containers or locally on MPS (Metal Performance Shaders) or CPU. However, running the backend service on MPS or CPU devices may result in significantly slower performance (FPS).

## Quick run with Docker

Docker is a platform designed to package applications and their dependencies into containers. These containers run consistently across different environments and machines. It simplifies deployment by eliminating the need for heavy prerequisite installations. That's why we strongly recommend you to use Docker.

### Prerequisites

Before you begin, ensure you have _Docker_ and _Docker Compose_ installed on your system.

### Installing Docker

To install Docker, follow these steps:

1. Go to the [Docker website](https://www.docker.com/get-started)
2. Follow the installation instructions for your operating system.

### Run with Docker

Open a terminal in the root folder, where there is the _docker-compose.yaml_ file.

Use the following command, to get both the frontend and backend running quickly using Docker:

```bash
docker compose up -d
```

This will start both frontend and backend services. If it is first run, this will build services before. You can then access the app at:

[http://localhost:7262](http://localhost:7262)

To stop the Docker containers and therefore the app use:

```bash
docker compose down
```

### Limitation

> [!WARNING]
> On macOS, Docker containers only support running on CPU. MPS is not supported through Docker. If you want to utilize MPS for GPU acceleration to run the app backend service, you will need to run it locally.

## Running without Docker - Local installation (Linux)

In some case, the limitation of Docker may make it unsuitable and you might need to run the backend directy on you local machine without Docker. For example, MPS is not supported with Docker which would prevent the use of GPU on macOS.


### Prerequisites

- Python 3.10+
- Yarn
- [SAM2 checkpoints](https://github.com/facebookresearch/sam2?tab=readme-ov-file#download-checkpoints)


###  Backend Setup

1. Install dependencies:

```bash
sudo apt-get install -y $(cat backend/packages.txt)
pip install -r backend/requirements.txt
```
2. Edit backend/.env according to your setup

3. Run the backend using backend/run_server.sh

#### Frontend Setup

1. Install dependencies
```bash
cd frontend
yarn install
```

2. Run the frontend
```bash
yarn dev
```
By default, frontend will be available at http://localhost:5173/


## Settings

The backend is at some point configurable through environment variables. Particularly, while running the server on your local machine you might be interested in adjusting parameters related to GPU usage.

- You can adjust the SAM 2 model size via `MODEL_SIZE`. Available values are `tiny`, `small`, `base_plus`, and `large`. A smaller model will be quicker, while a larger one will be more precise.

- If you are facing crashes due to insufficient GPU memory you can offload data to CPU with `OFFLOAD_VIDEO_TO_CPU=True`. It is a bit slower but will avoid crashes.

- You can switch to CPU device instead of GPU with `SAM2_FORCE_CPU_DEVICE=1`. It will significantly slow down the process but will make the app available for GPU-free devices or incompatible GPU.

> [!NOTE]
> If you want to change the values of these envrionment variables using Docker, you will need to edit the docker-compose.yaml file.
