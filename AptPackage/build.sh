#!/bin/bash

show_help() {
	cat <<EOF
Script to build the Cgf.CameraControl.Provider executable

Options:
    -s|--source                 Provide a folder where the project/solution is located
    -r|--runtime-identifier]    Select the runtime to compile for

    [-h|--help]                 Show this help.
EOF
}

get_path() {
	echo "$(
		cd "$(dirname "$1")" || exit
		pwd
	)/$(basename "$1")"
}

error() {
	echo -e "Error: $*"
	echo ""
	show_help
}


while (("$#")); do
	case "$1" in
	-r | --runtime-identifier)
		runtime_identifier="$2"
		shift 2
		;;
	-s | --source)
		source=$(get_path "$2")
		shift 2
		;;
	-h | --help)
		show_help
		exit 0
		;;
	--)
		shift
		break
		;;
	-*)
		error "unsupported option $1"
		exit 1
		;;
	*)
		error "unsupported parameter $1"
		exit 1
		;;
	esac
done

if ! [ -d "$source" ]; then
    error "Please provide a valid source location that contains the project/solution file."
    exit 1
fi

if [ -z "$runtime_identifier" ]; then
    error "Please provide a valid runtime identifier."
    exit 1
fi

dotnet publish "$source" -r "$runtime_identifier" -c Release --self-contained /p:PublishSingleFile=true
