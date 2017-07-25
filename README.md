# node_summit_17
Reference materials for Node Summit 2017 talk 'Tightly Packed Parallelization To Get Happy Hour Back'

This should provide some reference for putting together the most basic possible Node.js task scheduler using the 'child_process' module. Additionally, this provides material for putting together a basic distributed system for doing work in parallel with Node.js and Kubernetes. This is about as simple as it gets for getting started doing work in parallel with Node.js.

## Basic Task Scheduler

Our basic Node.js task scheduler utilizes the 'child_process' module to work on multiple tasks in parallel. This version of the task worker forks Node.js child processes off of the parent, but could be easily modified to spawn other executables or run commands as child processes.

The basic task scheduler can be found in the task_scheduler/ directory. The directory includes an example that imports the task scheduler and tasks to be run and then executes those tasks in parallel. To run the example, navigate to the task_scheduler/examples directory and run `node example1.js`.

## Distributed Worker System

The basic distributed worker system is put together to run on GKE. The following are steps to setup and run the distributed scheduler on GKE:
