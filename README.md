# Node Summit 2017
Reference materials for Node Summit 2017 talk 'Tightly Packed Parallelization To Get Happy Hour Back'

This should provide some reference for putting together the most basic possible Node.js task scheduler using the 'child_process' module. Additionally, this provides material for putting together a basic distributed system for doing work in parallel with Node.js and Kubernetes. This is about as simple as it gets for getting started doing work in parallel with Node.js.

## Basic Task Scheduler

Our basic Node.js task scheduler utilizes the 'child_process' module to work on multiple tasks in parallel. This version of the task worker forks Node.js child processes off of the parent, but could be easily modified to spawn other executables or run commands as child processes.

The task scheduler can be found at task_scheduler/task_scheduler.js. The task_scheduler/ directory also includes an example that imports the task scheduler and tasks to be run and then executes those tasks in parallel.

Try it out: 

1. `cd ./task_scheduler/examples`
2. `npm install` (the task_scheduler uses immutable as a dependency)
3. `node example1`

The scheduler should fork child processes to run tasks while resources available. As tasks exit, resources are refilled and dependencies are honored. Check out the task_scheduler/examples/tasks directory to view/modify the tasks to run in parallel.

### Improve our scheduler

* Allow for retries if child_process exits with error.
* Persist stats associated with tasks run and optimize on next run.

## Distributed Worker System

The basic distributed worker system is put together to run on GKE. The following are steps to setup and run the distributed scheduler on GKE:

### Requirements

gcloud - https://cloud.google.com/sdk/gcloud/

`gcloud -v`

docker - https://docs.docker.com/engine/installation/

`docker -v`

kubectl - https://kubernetes.io/docs/getting-started-guides/gce/#installing-the-kubernetes-command-line-tools-on-your-workstation

`kubectl version`

kubetail (optional) - this boss script to tail Kubernetes pod logs (https://github.com/johanhaleby/kubetail)

`curl https://raw.githubusercontent.com/johanhaleby/kubetail/master/kubetail > kubetail`

`chmod +x kubetail`

### Setup GCloud Project

https://cloud.google.com/resource-manager/docs/creating-managing-projects

`gcloud config set project PROJECT_ID`

Make sure Google Compute Engine API is enabled for project.

1. From console menu select 'API Manager'.
2. Click blue enable API button.
3. Search for 'Google Compute Engine API' and select.
4. Click blue enable button.

Make sure Google Container Registry API is enabled for project.

1. From console menu select 'API Manager'.
2. Click blue enable API button.
3. Search for 'Google Container Registry API' and select.
4. Click blue enable button.

Update distributed/jobs/filler.yaml and distributed/jobs/worker.yaml image tag replacing [PROJECT_ID] with the id for your gcloud project.

### Create a Cluster

(To list available zones run `gcloud compute zones list`)

`gcloud container clusters create CLUSTER_NAME --zone [ZONE]`

### Build Docker Containers Locally

`docker build -t filler -f ./distributed/jobs/Dockerfile.filler ./distributed/jobs/`

`docker build -t worker -f ./distributed/jobs/Dockerfile.worker ./distributed/jobs/`

### Tag Containers for GCR

`docker tag worker gcr.io/PROJECT_ID/filler`

`docker tag worker gcr.io/PROJECT_ID/worker`

### Push Containers to GCR

`gcloud docker -- push gcr.io/PROJECT_ID/filler`

`gcloud docker -- push gcr.io/PROJECT_ID/worker`

### Create Redis Master and Service

`kubectl create -f ./distributed/redis-service.yaml`

`kubectl create -f ./distributed/redis-master.yaml`

### Create Fill Job

`kubectl create -f ./distributed/jobs/filler.yaml`

### Create Worker Job

`kubectl create -f ./distributed/jobs/worker.yaml`

### Tail Worker Pod Logs

`./kubetail worker -k pod`

### Tear Down

`kubectl delete jobs/worker`

`kubectl delete jobs/filler`

`kubectl delete services/redis`

`kubectl delete pods/redis`

`gcloud container clusters delete CLUSTER_NAME --zone [ZONE]`

