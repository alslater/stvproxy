#!/bin/bash

function render_kibana_screenshot
{
  ESURL="https://search-livelogging-7g54mckm7rbuzdmmbcvidgc2x4.eu-west-2.es.amazonaws.com"
  KIBANA="${ESURL}/_plugin/kibana"

	filename=/var/www/html/${1}
	id=${2}

	node scripts/getkibana.js ${KIBANA}/goto/${id}?embed=true ${filename} >> run-render.log 2>&1
  if [ snapshot.template.htm -nt ${filename}.htm ]; then
    sed "s/__FILENAME__/${1}/" snapshot.template.htm > ${filename}.htm
  fi
}

function render_prtg_screenshot
{
	PRTGURL="https://monitor.scluk.com/public/mapshow.htm?"
	filename=/var/www/html/${1}
	id=${2}
	mapid=${3}

	node scripts/getscreenshot.js "${PRTGURL}id=${id}&mapid=${mapid}" ${filename} >> run-render.log 2>&1
  if [ snapshot.template.htm -nt ${filename} ]; then
    sed "s/__FILENAME__/${1}/" snapshot.template.htm > ${filename}.htm
  fi
}

cd /opt/stvproxy

set +H

### TECHNICAL STV1 ###

# Kibana STV Summary
render_kibana_screenshot dashboard1 9d13ef97dbc3b8478000ce1af192037e

# Kibana STV Dash #1
render_kibana_screenshot dashboard2 36c31309c645debd544f6c33589831ce

# Kibana STV Dash #2
render_kibana_screenshot dashboard3 73252eb99409abb2554528b8d980ed6d

# Kibana STV Dash #3
render_kibana_screenshot dashboard4 2605490b96415149d994a8f90d744016


# PRTG Summary
render_prtg_screenshot dashboard5 9619 48DD234E-DBBC-4B12-90C2-4F4572935A52

# PRTG Web Load
render_prtg_screenshot dashboard6 9620 EF4EE673-F3C8-4E3D-A487-84D68880DDA4

# PRTG Web Apache Status
render_prtg_screenshot dashboard7 9621 6BDDB5FD-7D0A-4802-BF95-6AB65F9678B5

### SUPPORT STV3 ###
render_kibana_screenshot stv3_dashboard1 269268f3fa6693e9d92132313fd185a8

### SUPPORT STV4 ###
render_kibana_screenshot stv4_dashboard1 901323f80152d47cb3ebebd7b945b49c

render_prtg_screenshot stv4_google_maps 7719 F0E01F49-11A3-4B0B-8F1D-30ABB67BF0EA

### SUPPORT STV5 ###
render_kibana_screenshot stv5_dashboard1 a93ecb88000b14e5ec0a61f4e26cd2e1
