#!/bin/bash
# ------------------------------------------------------------------
# Author: 		Simon Ensslen
# Date:			26.04.19
# 
# Description:	
# Generate package for Cgf.CameraControl.Provider service
# ------------------------------------------------------------------

# Prequisits - only change these lines
MAINTAINER='Simon Ensslen <simon.ensslen@griesser.ch>'

SCRIPT_LOCATION="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

show_help() {
	cat <<EOF
Script to create an apt Package for the Cgf.CameraControl.Provider package

Options:
    -s|--source                 Provide a folder where the compiled source files are located.
    [-o|--output-location]      Select the folder to which the generated package should be placed to
    [-c|--create-output-folder] When specified, the output folder will be automatically created

    [-h|--help]                 Show this help.
EOF
}

get_path() {
	echo "$(
		cd "$(dirname "$1")"
		pwd
	)/$(basename "$1")"
}

error() {
	echo -e "Error: $*"
	echo ""
	show_help
}

output_location="$HOME"

CREATE_OUTPUT_FOLDER="false"
while (("$#")); do
	case "$1" in
	-o | --output-location)
		output_location=$(get_path $2)
		shift 2
		;;
	-s | --source)
		source=$(get_path $2)
		shift 2
		;;
	-c | --create-output-folder)
		CREATE_OUTPUT_FOLDER="true"
		shift 1
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

pushd $SCRIPT_LOCATION
VERSION="$(git describe --dirty)"
echo using version number: $VERSION
popd

if ! [ -d "$output_location" ]; then
    if [ "$CREATE_OUTPUT_FOLDER" == "true" ]
	then
	    mkdir -p $output_location
	else
        error "Could not find output folder: $output_location. Please specify an existing folder"
        exit 1
	fi
fi

if ! [ -d "$source" ]; then
    error "Please provide a valid source location that contains all files needed to be installed in order to make the application run."
    exit 1
fi

PACKAGE_NAME="cgf-cameracontrol-provider"

UNDER="_"

echo 
echo "Generating package $PACKAGE_NAME of version: $VERSION to folder: $output_location"
echo "================================================================================="
echo

WORK_FOLDER=/tmp/$$
PACKAGE_NAME_AND_VERSION=$PACKAGE_NAME$UNDER$VERSION
PACKAGE_FOLDER=$WORK_FOLDER/$PACKAGE_NAME_AND_VERSION
mkdir -p $PACKAGE_FOLDER

# Add service

pushd $PACKAGE_FOLDER
INSTALLATION_FOLDER=opt/CgfCameraControl/
mkdir -p $INSTALLATION_FOLDER
cp -r $source/* $INSTALLATION_FOLDER

mkdir -p lib/systemd/system
SERVICE_NAME=cgf-cameracontrol-camerahost.service
cat > lib/systemd/system/$SERVICE_NAME << EOF
[Unit]
Description=Service that allows to control a Pan Tilt Zoom camera using a REST API
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=1
ExecStart=/$INSTALLATION_FOLDER/Cgf.CameraControl.CameraHost --urls http://0.0.0.0:5001

[Install]
WantedBy=multi-user.target
EOF
popd

# Add the Debian packaging files
pushd $PACKAGE_FOLDER
mkdir DEBIAN
cat > DEBIAN/control << EOF
Package: $PACKAGE_NAME
Version: $VERSION
Section: devel
Priority: optional
Maintainer: $MAINTAINER
Build-Depends: debhelper (>= 10)
Architecture: armhf
Depends: liblttng-ust0, libcurl4, libssl1.1, libkrb5-3, zlib1g, libicu63, avrdude
Description: Cgf.CameraControl.CameraHost
 Application that exposes the capabilities of Cgf.CameraControl.CameraController via a REST API and Websocket API
EOF

cat > DEBIAN/preinst << EOF
#!/bin/sh
#
# Make sure previous installation is deleted so it can be created successfully
#
# This file is derived from the preinstall script of JLink_Linux_V644g_x86_64.deb 
#

systemctl stop $SERVICE_NAME

SYS_SYMLINK_DIR=/$INSTALLATION_FOLDER
echo "Removing \${SYS_SYMLINK_DIR} ..."
if [ -e \${SYS_SYMLINK_DIR} ]       # Does it exist?
then
  if  [ -h \${SYS_SYMLINK_DIR} ]    # Is it a symbolic link?
  then
    rm -f \${SYS_SYMLINK_DIR}
  elif  [ -d \${SYS_SYMLINK_DIR} ]  # Is it a real folder?
  then
    rm -f -r \${SYS_SYMLINK_DIR}
  else 
    echo "Error: please remove \${SYS_SYMLINK_DIR}"
    exit 1                               # Unexpected result
  fi
else
  echo "\${SYS_SYMLINK_DIR} not found (OK)"
fi
exit 0
EOF
chmod 755 DEBIAN/preinst

echo
echo
echo DEBIAN/preinst:
cat DEBIAN/preinst
echo

cat > DEBIAN/postinst << EOF
#!/bin/sh

systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME
EOF
chmod 755 DEBIAN/postinst

echo
echo
echo DEBIAN/postinst:
cat DEBIAN/postinst
echo

popd

# Build the package
pushd $WORK_FOLDER
dpkg-deb --build $PACKAGE_NAME_AND_VERSION
mv *.deb $output_location
popd

# cleanup
rm -rf $WORK_FOLDER

echo ""
echo ""
