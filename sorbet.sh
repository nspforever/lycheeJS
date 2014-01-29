#!/bin/bash
#
# lycheeJS Sorbet
#
# Copyright (c) 2014 by LazerUnicorns Ltd.
#
# This project is released under the terms
# of the MIT License
#
# Please see the LICENSE.txt included with this
# distribution for further details.
#


UNAME_P=$(uname -p);
NODEJS=$(which nodejs);
NODE=$(which node);
SORBET_ROOT=$(cd "$(dirname "$0")"; pwd);
SORBET_LOG=$SORBET_ROOT/sorbet/.log;
SORBET_PID=$SORBET_ROOT/sorbet/.pid;



usage() {

cat <<EOF

lycheeJS Sorbet v0.8

This program comes with ABSOLUT NO WARRANTY;
This is free software, and you are welcome to redistribute it under certain conditions;
See the LICENSE.txt for details.


Recommended development environment: Ubuntu 13.04 64Bit

Usage: $0 <task> [ <options> ]


Tasks:

    help          Shows this help message
    install       Installs a third-party github project into /external
    start         Starts the webserver
    stop          Stops the webserver
    restart       Restarts the webserver
    status        Checks whether the webserver is running or not

Options:

    start <profile>
    <profile> is the ID of the profile to use. All profiles are located inside the /sorbet/profile/ folder.

    install <url> <name>
    <url> is a URL to the zip archive (of the specific branch) on github. The project will be installed to /external/<name>.
	The name has to be identical to the archive's folder prefix.

Examples:

    $0 start default
    $0 stop
    $0 install https://github.com/LazerUnicorns/lycheeJS-website/archive/master.zip lycheeJS-website
    $0 start lycheejs.org

EOF

}

check_success() {

	if [ ! "$?" -eq "0" ]
	then

		if [ "$1" != "" ]
		then
			check_success_step "FAILURE" "$1";
		else
			check_success_step "FAILURE" "Sub-Process exited with exit code $?";
		fi;

	fi;

}

# check_success_step "FAILURE" "message"
# check_success_step "SUCCESS" "message"
check_success_step() {

	if [ "$1" == "SUCCESS" ]
	then
		echo -e "done.";
	else
		echo -e "failed. ($2)";
		finish 1;
	fi;

}

# finish 1
finish() {

	if [ $1 -eq 1 ]
	then

		echo -e "\n\nERROR: It seems as lycheeJS Sorbet had a problem.\n\n";
		echo -e "If this error occurs though following the guidelines,";
		echo -e "please report an issue at https://github.com/LazerUnicorns/lycheeJS/issues";
		echo -e "and attach the ./log.txt file to it. Thanks!";

	fi;

	exit $1;

}


# install_project "http://url/to/file.zip" "name"
install_project() {

	echo -e "\n\n~ ~ ~ install_project($1 $2) ~ ~ ~\n" >> $SORBET_LOG;

	cd $SORBET_ROOT;
	echo -e "Preparing folder structure:\n" >> $SORBET_LOG;

	if [ ! -d "$SORBET_ROOT/external" ]
	then
		mkdir "$SORBET_ROOT/external" >> $SORBET_LOG 2>&1;
	fi;

	if [ ! -d "$SORBET_ROOT/external/.temp" ]
	then
		mkdir "$SORBET_ROOT/external/.temp" >> $SORBET_LOG 2>&1;
		check_success;
	fi;


	if [ -d "$SORBET_ROOT/external/$2" ]
	then
		echo -e "ERROR: Folder already exists (external/$2)\n" >> $SORBET_LOG;
		check_success_step "FAILURE";
	fi;


	echo -e "Downloading zip file:\n" >> $SORBET_LOG;
	wget -O "external/$2.zip" "$1" >> $SORBET_LOG 2>&1;
	check_success "Could not download zip file (wget)";

	echo -e "Extracting zip file:\n" >> $SORBET_LOG;
	unzip "external/$2.zip" -d "external/.temp" >> $SORBET_LOG 2>&1;
	check_success "Could not extract zip file (unzip)";

	rm "external/$2.zip" >> $SORBET_LOG 2>&1;
	check_success "Could not cleanup zip file";

	mv $SORBET_ROOT/external/.temp/"$2"-* "$SORBET_ROOT/external/$2" >> $SORBET_LOG 2>&1;
	check_success "Could not move extracted files to external/$2";

	rm -rf "$SORBET_ROOT/external/.temp" >> $SORBET_LOG 2>&1;
	check_success "Could not cleanup temporary folder";


	check_success_step "SUCCESS";

}

start_sorbet() {

	echo -e "\n\n~ ~ ~ start_sorbet($1) ~ ~ ~\n" >> $SORBET_LOG;

	echo -e "Environment: "$(uname -a) >> $SORBET_LOG;


	cd $SORBET_ROOT;


	if [ -f "$SORBET_PID" ]
	then
		echo -e "Sorbet is already running!";
	else

		nodejs_command="";

		if [ "$NODEJS" != "" ]
		then
			nodejs_command="$NODEJS";
		fi;

		if [ "$NODE" != "" ]
		then
			nodejs_command="$NODE";
		fi;


		echo -e "nodejs_command: $nodejs_command" >> $SORBET_LOG;


		if [ "$nodejs_command" != "" ]
		then

			cd $SORBET_ROOT/sorbet;

			nohup $nodejs_command init.js $1 >> $SORBET_LOG &
			sorbet_pid=$!;

			echo $sorbet_pid > $SORBET_PID;
			check_success;

			echo -e "sorbet_pid: $sorbet_pid.\n" >> $SORBET_LOG;
		
		fi;

	fi;

	check_success_step "SUCCESS";

}

stop_sorbet() {

	echo -e "\n\n~ ~ ~ stop_sorbet() ~ ~ ~\n" >> $SORBET_LOG;

	cd $SORBET_ROOT;


	if [ -f "$SORBET_PID" ]
	then

		sorbet_pid=$(cat $SORBET_PID);

		echo -e "Process ID is $sorbet_pid.\n" >> $SORBET_LOG;

		if [ "$sorbet_pid" != "" ]
		then

			if ps -p $sorbet_pid > /dev/null
			then
				pkill -P $sorbet_pid > /dev/null 2>&1;
				kill $sorbet_pid > /dev/null 2>&1;
			fi;

		fi;

		rm "$SORBET_PID" >> $SORBET_LOG 2>&1;
		check_success "Could not cleanup PID file";

	fi;


	check_success_step "SUCCESS";

}



case "$1" in

	help)
		usage;
		exit;
		;;

	install)

		echo -e "\nInstalling external github project ...";
		install_project "$2" "$3";

		exit;
		;;

	start)

		echo -e "\nStarting Sorbet ...";

		profile="$2";

		if [ ! -f "$SORBET_ROOT/sorbet/profile/$profile.json" ]
		then
			echo -e "\tInvalid <profile>, falling back to 'default'.";
			profile="default";
		fi;


		start_sorbet $profile;

		exit;
		;;

	status)

		if [ -f "$SORBET_PID" ]
		then

			sorbet_pid=$(cat $SORBET_PID);
			sorbet_status=$(ps -e | grep $sorbet_pid | grep -v grep);

			if [ "$sorbet_status" != "" ]
			then
				echo -e "Running";
				exit 0;
			else
				echo -e "Not running";
				exit 1;
			fi;

		else

			echo -e "Not running";
			exit 1;

		fi;

		exit;
		;;

	stop)

		echo -e "\nStopping Sorbet ...";
		stop_sorbet;

		exit;
		;;

	restart)

		echo -e "\nRestarting Sorbet ...";

		profile="$2";
		if [ "$profile" == "" ]
		then
			profile="default";
		fi;


		stop_sorbet;
		start_sorbet $profile;

		exit;
		;;

esac;



usage;

