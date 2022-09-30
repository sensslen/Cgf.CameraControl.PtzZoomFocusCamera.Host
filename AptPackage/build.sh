#!/bin/bash

input=$1

dotnet publish $input -r linux-arm -c Release --self-contained /p:PublishSingleFile=true /p:PublishTrimmed=true
