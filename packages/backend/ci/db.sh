#!/bin/bash
# SSH connection details (credentials to connect to production server)
username="abou"
hostname="ultra-glk.com"
# Remote server details
remote_directory="/home/abou/sites/Yeye_dir/src/database/dump"
remote_command="pg_dump -U abou -d dbyeye > db-sauv-$(date +'%m_%d_%Y').sql"
# Local machine details
local_directory="/home/abou/dev/projets/Yeye_lts/backup"
# SSH into the remote server and execute the command (run commandin remote host )
ssh "$username@$hostname" "cd \"$remote_directory\"; $remote_command"
# Copy the dump file from the remote server to the local machine
scp "$username@$hostname:$remote_directory/db-sauv-$(date +'%m_%d_%Y').sql" "$local_directory"
echo "Database dump file has been downloaded to: $local_directory/db-sauv-$(date +'%m_%d_%Y').sql"
echo "Copie de la base de donne sur la machine local"