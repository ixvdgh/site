#!/bin/sh

KEY_NAME=${KEY_NAME:-id_rsa}

rm -rf $KEY_NAME $KEY_NAME.pub

ssh-keygen -t rsa -b 1024 -f $KEY_NAME -N "" -C "repo@site"
