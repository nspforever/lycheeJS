#!/bin/bash

git checkout dev-0.8;

./sorbet.sh clone git@github.com:LazerUnicorns/lycheeJS-slides lycheeJS-slides master;
./sorbet.sh clone git@github.com:LazerUnicorns/lycheeJS-website lycheeJS-website master;

