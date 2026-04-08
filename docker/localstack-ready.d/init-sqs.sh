#!/bin/sh
set -e
awslocal sqs create-queue --queue-name vehicle-import-queue
