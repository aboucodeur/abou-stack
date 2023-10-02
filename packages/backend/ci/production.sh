#!/bin/bash

# INTERFACE 
UI() {
    echo "-----------------------------------"
    echo "  YEYE -GESTION DE STOCK "
    echo "-----------------------------------"
    echo "( prod ) - Production"
    echo "( dev )  - Development"
    read -rp "MODE : -----> : " mode
}

getAndSettingENVFile() {
    # POSITIONER ENVIRONNEMENT EN FONCTION DU MODE
    if [[ $mode == "prod" && -f "$SERVER_PATH/.env_prod" ]]; then
        cp $SERVER_PATH/.env_prod $SERVER_PATH/.env
    elif [[ $mode == "dev" && -f "$SERVER_PATH/.env_dev" ]]; then
        cp $SERVER_PATH/.env_dev $SERVER_PATH/.env
    fi
    echo "ENV : $(head -1 $SERVER_PATH/.env)"
}

getClientURL () {
    if [ $mode == "prod" ]; then 
        echo $CONSTANT_PROD > $CLIENT_PATH/src/constant.js
        echo 'export const APP_NAME = "YEYE"' >> $CLIENT_PATH/src/constant.js
    elif [ $mode == "dev" ]; then
        echo $CONSTANT_DEV > $CLIENT_PATH/src/constant.js
        echo 'export const APP_NAME = "YEYE"' >> $CLIENT_PATH/src/constant.js
    fi
    echo "FINISH : CHANGE API URL"
}

buildREACT () {
    cd $CLIENT_PATH
    npm run build && rm -rf $SERVER_PATH/client/build
    mv $CLIENT_PATH/build $SERVER_PATH/client
    echo "FINISH : REACT CONF"
}

# FONCTION PRINCIPALE ICI
productionREADY () {
    rm -rf $SERVER_PATH/dist/*
    cd $SERVER_PATH && npm run build:$mode
    # DIST ASSETS AND SETTINGS
        mkdir -p $SERVER_PATH/dist/src/{uploads,database/dump}
        cp -r $SERVER_PATH/client $SERVER_PATH/dist
        cp -r $SERVER_PATH/src/database/pg_constraint.sql $SERVER_PATH/dist
        cp -r $SERVER_PATH/src/database/pg_constraint.sql $SERVER_PATH/dist/src/database
        # COMMAND FOR SPECIFIC MODE
        if [[ $mode == "prod" ]]; then 
            cp -r $SERVER_PATH/{node_modules,package.json,dump.js} $SERVER_PATH/dist
        else
            cp -r $SERVER_PATH/{node_modules,package.json,dump.js,.npmrc} $SERVER_PATH/dist
            if [[ -f $SERVER_PATH/.cache/puppeteer/chrome/chrome-linux-x64 ]]; then
                cp $SERVER_PATH/.cache/puppeteer/chrome/chrome-linux-x64 $SERVER_PATH/dist # Pour linux
            fi
        fi
    # DEPLOY COMMAND : TO REMOTE SERVER
    if [[ $mode == "prod" ]]; then
        read -rp "Vous voulez la version non compiler (O(o) / N(n)) : " choice
        if [[ $choice == 'O' || $choice == 'o' ]]; then
            echo "DEPLOIEMENT DE LA VERSION NON COMPILER EN COURS "
            # POST TRANSFERT (FICHIER NON NECESSAIRE POUR LA TRANSFERT)
            rm -rf $SERVER_PATH/dist # LE DIST EST FAIT EN AMONT
            mv $SERVER_PATH/node_modules/ $PREFIX/tmp # contient les packages de L'API REST FULL
            mv $SERVER_PATH/.cache/ $PREFIX/.cache  # contient la version executable de chromium
            #! COPIE DU CODE SOURCE DU FRONTEND (Sauvegarger la version non bundler tres important)
            mkdir -p $SERVER_PATH/client/source_code
            mv $CLIENT_PATH/node_modules/ $PREFIX/tmp2
            # compresser avant de mettre sur le serveur
            cp -r $CLIENT_PATH/ $SERVER_PATH/client/source_code/
            mv $PREFIX/tmp2/ $CLIENT_PATH/node_modules
            # TRANSFERT
            rsync -avz --no-perms -e ssh $SERVER_PATH/ $SSH_PARAMS:/home/abou/sites/Yeye_$(date +'%m_%d_%Y')
            # POST TRANSFERT
            mv $PREFIX/tmp/ $SERVER_PATH/node_modules
            mv $PREFIX/.cache/ $SERVER_PATH/.cache
        else
            read -rp "Confirmer le deploiement de la version (BUNDLE) (O(o) / N(n)) " confirmation
            # TRANSFERT
            if [[ $confirmation == "O" || $confirmation == "o" ]] ; then 
                mv $SERVER_PATH/dist/node_modules/ $PREFIX/tmp_dist
                rsync -avz --no-perms -e ssh $SERVER_PATH/dist/ $SSH_PARAMS:/home/abou/sites/Yeye_$(date +'%m_%d_%Y')
                verbose "FINISH : TO PUSH DIST/ TO SERVER"
                mv $PREFIX/tmp_dist/ $SERVER_PATH/dist/node_modules
            fi
        fi
    fi

}

# DEFAULT VARIABLES
PREFIX=/home/abou/dev/projets/Yeye_lts
SERVER_PATH=$PREFIX/server
CLIENT_PATH=$PREFIX/frontend

SIP=66.175.214.6
CONSTANT_DEV="export const API_URL = \"http://localhost:3001/api/v1\""
CONSTANT_PROD="export const API_URL = \"http://$SIP/api/v1\""
SSH_PARAMS=abou@$SIP

# LOGIQUE DU PROGRAMME
UI
echo "-----------------------------------"
if [[ $mode == "dev" ]]; then
    getAndSettingENVFile # Positionner les valeurs de l'environnement en cours
    getClientURL # CSR : SERVER URL IN CLIENT
fi
buildREACT # BUILD REACT AND COPY TO SERVER
productionREADY # DEPLOY APPLICATION (SOURCE_CODE)