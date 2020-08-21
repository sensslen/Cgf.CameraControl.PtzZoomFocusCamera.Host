
input=$1

dotnet publish $input -r linux-arm -c Release /p:PublishSingleFile=true /p:PublishTrimmed=true
