#!/bin/bash

SCRIPT_LOCATION="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

show_help() {
	cat <<EOF
Script to build the Cgf.CameraControl.Provider executable

Options:
    [-o|--output-location]      Provide the output location to write the output to

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

output_location="$HOME"
while (("$#")); do
	case "$1" in
	-o|--output-location)
		output_location=$(get_path "$2")
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

if ! [ -d "$output_location" ]; then
    error "Please provide a valid output location."
    exit 1
fi

"$SCRIPT_LOCATION"/build.sh -r linux-arm -s "$SCRIPT_LOCATION/../"
"$SCRIPT_LOCATION"/createPackage.sh -s "$SCRIPT_LOCATION/../bin/Release/net8.0/linux-arm/publish/" -ps "linux-arm"

"$SCRIPT_LOCATION"/build.sh -r linux-arm64 -s "$SCRIPT_LOCATION/../"
"$SCRIPT_LOCATION"/createPackage.sh -s "$SCRIPT_LOCATION/../bin/Release/net8.0/linux-arm64/publish/" -ps "linux-arm64"
